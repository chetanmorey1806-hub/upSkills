export default {
  id: "day-09-cross-validation-hyperparameter-tuning-bias-variance",
  title: "Cross-Validation, Hyperparameter Tuning (GridSearchCV, RandomizedSearchCV), Bias-Variance and Overfitting",
  module: "Module 3: Unsupervised & Model Quality",
  day: 9,
  level: "Advanced",
  duration: "3 hours",
  summary: "A model is only as good as your estimate of how it performs on unseen data. Learn K-fold and stratified cross-validation, how to tune hyperparameters with GridSearchCV and RandomizedSearchCV without leaking information, and how to diagnose overfitting and underfitting with the bias-variance trade-off, validation curves and learning curves.",
  objectives: [
    "Explain why a single train-test split is noisy and how K-fold cross-validation fixes it",
    "Choose the right CV strategy: KFold, StratifiedKFold, GroupKFold, TimeSeriesSplit",
    "Tune hyperparameters with GridSearchCV and RandomizedSearchCV on a Pipeline",
    "Explain the bias-variance trade-off and recognise underfitting vs overfitting",
    "Use validation curves, learning curves and nested CV to make sound decisions",
  ],
  theory: [
    {
      heading: "Why Cross-Validation?",
      content: "With one train-test split, your score depends on which rows happened to land in the test set. Change random_state and accuracy may jump from 0.93 to 0.97. **K-fold cross-validation** splits the data into k equal folds; it trains k times, each time using one fold as validation and the other k−1 as training, then averages the k scores. Every row is used for validation exactly once.\n\nYou get a **mean** (expected performance) and a **standard deviation** (stability). k = 5 or 10 is standard. Leave-One-Out (k = n) has low bias but is expensive and high variance.",
      syntax: `from sklearn.model_selection import cross_val_score, cross_validate, StratifiedKFold
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipeline, X, y, cv=cv, scoring="f1")
scores.mean(), scores.std()`,
      tip: "Keep a final hold-out test set that you never use during CV or tuning. CV is for model selection; the test set is for the final, honest report.",
    },
    {
      heading: "Choosing the Right CV Splitter",
      content: "The splitter must mimic how the model will meet new data in production.",
      points: [
        "KFold: regression or generic data (use shuffle=True unless order matters)",
        "StratifiedKFold: classification — keeps class proportions in every fold (default for classifiers when cv=int)",
        "GroupKFold / StratifiedGroupKFold: several rows per patient / customer / store — the same group must never appear in both train and validation, otherwise the model 'recognises' the person (leakage)",
        "TimeSeriesSplit: ordered data — always train on the past, validate on the future",
        "RepeatedStratifiedKFold: repeat CV with different shuffles for a more stable estimate on small data",
      ],
    },
    {
      heading: "Hyperparameter Tuning: Grid vs Random Search",
      content: "**GridSearchCV** tries **every combination** in a parameter grid with cross-validation and keeps the best (by `scoring`). Simple and exhaustive, but cost explodes: 5 values × 5 values × 4 values × 5 folds = 500 fits.\n\n**RandomizedSearchCV** samples `n_iter` random combinations from distributions (e.g. `loguniform(1e-3, 1e2)` for C). Bergstra & Bengio (2012) showed random search finds good settings far faster when only a few hyperparameters really matter, because it tries more distinct values of each.\n\nOther options: **HalvingGridSearchCV / HalvingRandomSearchCV** (successive halving — give many candidates a small budget, keep the best), and Bayesian optimisation libraries like **Optuna**.",
      syntax: `from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
grid = GridSearchCV(pipe, {"clf__C": [0.1, 1, 10]}, cv=5, scoring="roc_auc", n_jobs=-1)
grid.fit(X_train, y_train)
grid.best_params_, grid.best_score_, grid.best_estimator_   # refit on all training data`,
      tip: "Search on a log scale for C, alpha, gamma and learning_rate: [0.001, 0.01, 0.1, 1, 10, 100].",
    },
    {
      heading: "The Bias-Variance Trade-off",
      content: "Expected test error = **Bias² + Variance + Irreducible noise**.\n\n**Bias**: error from wrong assumptions — the model is too simple to capture the pattern (a straight line for a curve). High bias → **underfitting**: training and validation errors are both high.\n\n**Variance**: error from sensitivity to the particular training sample — the model is too flexible and learns noise. High variance → **overfitting**: training error is low, validation error much higher.\n\nIncreasing model complexity lowers bias but raises variance. The sweet spot minimises total error. Noise cannot be removed by any model.",
      points: [
        "Underfitting fixes: more complex model, more / better features, less regularisation, train longer",
        "Overfitting fixes: more data, regularisation (Ridge, C, alpha), simpler model (max_depth), feature selection, early stopping, dropout, bagging / ensembles, data augmentation",
      ],
    },
    {
      heading: "Validation Curves and Learning Curves",
      content: "A **validation curve** plots training and validation score against **one hyperparameter** (e.g. max_depth 1-20). On the left both are low (underfit); on the right training keeps rising while validation falls (overfit). The best value is where validation peaks.\n\nA **learning curve** plots scores against **training set size**. If both curves converge at a low score → high bias: more data will NOT help, use a more powerful model. If there is a large gap that narrows as data grows → high variance: more data WILL help.",
      syntax: `from sklearn.model_selection import validation_curve, learning_curve
train_s, val_s = validation_curve(model, X, y, param_name="max_depth",
                                  param_range=range(1, 15), cv=5)
sizes, train_s, val_s = learning_curve(model, X, y, cv=5,
                                       train_sizes=[0.1, 0.3, 0.5, 0.7, 1.0])`,
    },
    {
      heading: "Avoiding Leakage During Tuning and Nested CV",
      content: "Two classic tuning mistakes: (1) preprocessing (scaling, SMOTE, feature selection) outside the Pipeline, so it sees the validation folds; (2) reporting `best_score_` as the final performance — it is optimistically biased because you picked the maximum among many tries.\n\nFor an unbiased estimate of the whole procedure (including tuning), use **nested cross-validation**: an inner CV loop tunes hyperparameters, an outer CV loop evaluates the tuned model. In practice, a separate untouched test set plays the role of the outer loop.",
      syntax: `inner = GridSearchCV(pipe, grid, cv=3)
outer_scores = cross_val_score(inner, X, y, cv=5)   # nested CV`,
    },
  ],
  examples: [
    {
      title: "One Split vs K-Fold Cross-Validation",
      scenario: "Show how much a single train-test split's score varies with random_state, and how CV gives a more reliable estimate.",
      steps: [
        "Evaluate a decision tree on 5 different random splits",
        "Run 5-fold stratified CV",
        "Compare the spread of scores",
      ],
      code: `import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(return_X_y=True)
model = DecisionTreeClassifier(max_depth=4, random_state=0)

single = []
for seed in range(5):
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=seed, stratify=y)
    single.append(model.fit(X_tr, y_tr).score(X_te, y_te))
print("Single-split scores:", np.round(single, 3))

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv)
print("5-fold CV scores   :", scores.round(3))
print(f"CV mean={scores.mean():.3f} std={scores.std():.3f}")
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(return_X_y=True)
model = DecisionTreeClassifier(max_depth=4, random_state=0)

single = []
for seed in range(5):
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=seed, stratify=y)
    single.append(model.fit(X_tr, y_tr).score(X_te, y_te))
print("Single-split scores:", np.round(single, 3))

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv)
print("5-fold CV scores   :", scores.round(3))
print(f"CV mean={scores.mean():.3f} std={scores.std():.3f}")
` } },
      result: "Single-split scores: [0.939 0.974 0.965 0.93  0.921]\n5-fold CV scores   : [0.947 0.895 0.921 0.93  0.947]\nCV mean=0.928 std=0.019",
      explanation: "Single-split accuracy swings by several percentage points depending only on the random seed. Cross-validation averages over 5 folds and reports a standard deviation, so you can say 'about 93% ± 2%' — a far more honest statement. When comparing two models, compare CV means and consider their spread.",
    },
    {
      title: "GridSearchCV on a Pipeline",
      scenario: "Tune C and gamma of an SVM inside a scaling pipeline, using ROC-AUC, and evaluate the best model on a held-out test set.",
      steps: [
        "Split off a 20% test set",
        "Define pipeline and parameter grid with step__param names",
        "Fit GridSearchCV (5-fold) on training data",
        "Report best params, CV score and final test score",
      ],
      code: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import roc_auc_score

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

pipe = Pipeline([("scale", StandardScaler()), ("svc", SVC())])
grid = {"svc__C": [0.1, 1, 10, 100], "svc__gamma": [0.001, 0.01, 0.1, 1]}
search = GridSearchCV(pipe, grid, cv=5, scoring="roc_auc", n_jobs=-1)
search.fit(X_tr, y_tr)

print("Combinations tried:", len(search.cv_results_["params"]), "x 5 folds")
print("Best params:", search.best_params_)
print("Best CV ROC-AUC:", round(search.best_score_, 4))
test_auc = roc_auc_score(y_te, search.decision_function(X_te))
print("Test ROC-AUC:", round(test_auc, 4))
`,
      python: { files: { "main.py": `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import roc_auc_score

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

pipe = Pipeline([("scale", StandardScaler()), ("svc", SVC())])
grid = {"svc__C": [0.1, 1, 10, 100], "svc__gamma": [0.001, 0.01, 0.1, 1]}
search = GridSearchCV(pipe, grid, cv=5, scoring="roc_auc", n_jobs=-1)
search.fit(X_tr, y_tr)

print("Combinations tried:", len(search.cv_results_["params"]), "x 5 folds")
print("Best params:", search.best_params_)
print("Best CV ROC-AUC:", round(search.best_score_, 4))
test_auc = roc_auc_score(y_te, search.decision_function(X_te))
print("Test ROC-AUC:", round(test_auc, 4))
` } },
      result: "Combinations tried: 16 x 5 folds\nBest params: {'svc__C': 10, 'svc__gamma': 0.01}\nBest CV ROC-AUC: 0.9954\nTest ROC-AUC: 0.9977",
      explanation: "GridSearchCV fitted 16 combinations × 5 folds = 80 models, picked the best by mean CV ROC-AUC, then refit it on the full training set (refit=True). Scaling sits inside the pipeline, so each fold's scaler only sees that fold's training part. The test score, computed once at the end, is the number you report.",
    },
    {
      title: "RandomizedSearchCV for a Random Forest",
      scenario: "A larger search space for a random forest: sample 20 random combinations instead of trying hundreds.",
      steps: [
        "Define distributions with scipy.stats randint",
        "Run RandomizedSearchCV with n_iter=20",
        "Print the top 3 candidates from cv_results_",
      ],
      code: `import pandas as pd
from scipy.stats import randint
from sklearn.datasets import make_classification
from sklearn.model_selection import RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier

X, y = make_classification(n_samples=1000, n_features=20, n_informative=6, random_state=42)

dist = {
    "n_estimators": randint(50, 300),
    "max_depth": [None, 4, 8, 12],
    "min_samples_leaf": randint(1, 10),
    "max_features": ["sqrt", "log2", 0.5],
}
search = RandomizedSearchCV(RandomForestClassifier(random_state=42), dist, n_iter=20,
                            cv=5, scoring="accuracy", random_state=42, n_jobs=-1)
search.fit(X, y)

res = pd.DataFrame(search.cv_results_).sort_values("rank_test_score")
cols = ["param_n_estimators", "param_max_depth", "param_min_samples_leaf",
        "param_max_features", "mean_test_score"]
print(res[cols].head(3).to_string(index=False))
print("Best:", search.best_params_)
`,
      python: { files: { "main.py": `import pandas as pd
from scipy.stats import randint
from sklearn.datasets import make_classification
from sklearn.model_selection import RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier

X, y = make_classification(n_samples=1000, n_features=20, n_informative=6, random_state=42)

dist = {
    "n_estimators": randint(50, 300),
    "max_depth": [None, 4, 8, 12],
    "min_samples_leaf": randint(1, 10),
    "max_features": ["sqrt", "log2", 0.5],
}
search = RandomizedSearchCV(RandomForestClassifier(random_state=42), dist, n_iter=20,
                            cv=5, scoring="accuracy", random_state=42, n_jobs=-1)
search.fit(X, y)

res = pd.DataFrame(search.cv_results_).sort_values("rank_test_score")
cols = ["param_n_estimators", "param_max_depth", "param_min_samples_leaf",
        "param_max_features", "mean_test_score"]
print(res[cols].head(3).to_string(index=False))
print("Best:", search.best_params_)
` } },
      result: " param_n_estimators param_max_depth  param_min_samples_leaf param_max_features  mean_test_score\n                264            None                       3                0.5            0.887\n                255            None                       3                0.5            0.887\n                122               8                       5                0.5            0.884\nBest: {'max_depth': None, 'max_features': 0.5, 'min_samples_leaf': 3, 'n_estimators': 264}",
      explanation: "The full grid here would have hundreds of combinations; random search evaluated only 20 and still found a strong configuration. cv_results_ holds every candidate's mean and std score, which helps you see which parameters matter. Notice that the top candidates often score within noise of each other.",
    },
    {
      title: "Validation Curve: Diagnosing Under- and Overfitting",
      scenario: "Vary max_depth of a decision tree and watch training and validation accuracy diverge.",
      steps: [
        "Use validation_curve with max_depth 1..12",
        "Print mean train and validation accuracy for each depth",
        "Identify underfit, sweet spot and overfit regions",
      ],
      code: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import validation_curve
from sklearn.tree import DecisionTreeClassifier

X, y = make_classification(n_samples=1000, n_features=20, n_informative=5,
                           flip_y=0.1, random_state=42)
depths = [1, 2, 3, 4, 6, 8, 10, 12]
train_s, val_s = validation_curve(DecisionTreeClassifier(random_state=42), X, y,
                                  param_name="max_depth", param_range=depths, cv=5)
for d, tr, va in zip(depths, train_s.mean(axis=1), val_s.mean(axis=1)):
    print(f"depth={d:2d} train={tr:.3f} val={va:.3f} gap={tr - va:.3f}")
print("Best depth:", depths[int(np.argmax(val_s.mean(axis=1)))])
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import validation_curve
from sklearn.tree import DecisionTreeClassifier

X, y = make_classification(n_samples=1000, n_features=20, n_informative=5,
                           flip_y=0.1, random_state=42)
depths = [1, 2, 3, 4, 6, 8, 10, 12]
train_s, val_s = validation_curve(DecisionTreeClassifier(random_state=42), X, y,
                                  param_name="max_depth", param_range=depths, cv=5)
for d, tr, va in zip(depths, train_s.mean(axis=1), val_s.mean(axis=1)):
    print(f"depth={d:2d} train={tr:.3f} val={va:.3f} gap={tr - va:.3f}")
print("Best depth:", depths[int(np.argmax(val_s.mean(axis=1)))])
` } },
      result: "depth= 1 train=0.713 val=0.704 gap=0.009\ndepth= 2 train=0.807 val=0.783 gap=0.024\ndepth= 3 train=0.862 val=0.823 gap=0.038\ndepth= 4 train=0.886 val=0.842 gap=0.044\ndepth= 6 train=0.936 val=0.846 gap=0.091\ndepth= 8 train=0.975 val=0.822 gap=0.153\ndepth=10 train=0.994 val=0.811 gap=0.183\ndepth=12 train=1.000 val=0.801 gap=0.198\nBest depth: 6",
      explanation: "At depth 1-2 both scores are low — high bias (underfitting). Validation accuracy peaks at a moderate depth. Beyond that, training accuracy keeps climbing towards 1.0 while validation drops — the widening gap is the signature of high variance (overfitting). flip_y=0.1 adds 10% label noise that a deep tree memorises.",
    },
    {
      title: "Learning Curve: Will More Data Help?",
      scenario: "Before paying to label more data, check whether a model is limited by bias or variance.",
      steps: [
        "Compute learning curves for a high-bias model (depth-1 tree) and a high-variance model (unlimited tree)",
        "Compare the gap between training and validation scores as data grows",
      ],
      code: `from sklearn.datasets import make_classification
from sklearn.model_selection import learning_curve
from sklearn.tree import DecisionTreeClassifier

X, y = make_classification(n_samples=2000, n_features=20, n_informative=8,
                           flip_y=0.05, random_state=0)
for name, depth in [("depth=1 (high bias)", 1), ("no limit (high variance)", None)]:
    sizes, tr, va = learning_curve(DecisionTreeClassifier(max_depth=depth, random_state=0),
                                   X, y, cv=5, train_sizes=[0.1, 0.3, 0.6, 1.0])
    print(name)
    for n, a, b in zip(sizes, tr.mean(axis=1), va.mean(axis=1)):
        print(f"  n={n:4d} train={a:.3f} val={b:.3f}")
`,
      python: { files: { "main.py": `from sklearn.datasets import make_classification
from sklearn.model_selection import learning_curve
from sklearn.tree import DecisionTreeClassifier

X, y = make_classification(n_samples=2000, n_features=20, n_informative=8,
                           flip_y=0.05, random_state=0)
for name, depth in [("depth=1 (high bias)", 1), ("no limit (high variance)", None)]:
    sizes, tr, va = learning_curve(DecisionTreeClassifier(max_depth=depth, random_state=0),
                                   X, y, cv=5, train_sizes=[0.1, 0.3, 0.6, 1.0])
    print(name)
    for n, a, b in zip(sizes, tr.mean(axis=1), va.mean(axis=1)):
        print(f"  n={n:4d} train={a:.3f} val={b:.3f}")
` } },
      result: "depth=1 (high bias)\n  n= 160 train=0.781 val=0.725\n  n= 480 train=0.756 val=0.734\n  n= 960 train=0.761 val=0.713\n  n=1600 train=0.746 val=0.732\nno limit (high variance)\n  n= 160 train=1.000 val=0.770\n  n= 480 train=1.000 val=0.793\n  n= 960 train=1.000 val=0.814\n  n=1600 train=1.000 val=0.818",
      explanation: "For the stump (depth 1) training and validation scores are close and flat — collecting more data will not help; you need a more complex model. For the unlimited tree, training accuracy stays at 1.0 and validation improves as data grows — a variance problem that more data (or regularisation / ensembling) can fix.",
    },
  ],
  interview: [
    { q: "What is K-fold cross-validation and why use it?", a: "The data is split into k folds; the model is trained k times, each time on k−1 folds and validated on the remaining fold. The k scores are averaged. It uses all data for both training and validation, reduces the variance of the performance estimate compared to a single split, and provides a standard deviation for stability.", level: "Easy" },
    { q: "What is stratified K-fold and when do you need it?", a: "Stratified K-fold keeps the class distribution in each fold the same as in the full dataset. It is essential for classification, especially with imbalanced classes, where a random fold might contain very few or no minority samples. sklearn uses it by default when cv is an integer and the estimator is a classifier.", level: "Easy" },
    { q: "How do you do cross-validation for time-series data?", a: "Use forward-chaining (TimeSeriesSplit): each split trains on an initial time window and validates on the following period, expanding the window over time. Never shuffle, because using future data to predict the past causes leakage. Optionally include a gap between train and validation to mimic forecast horizons.", level: "Medium" },
    { q: "What is GroupKFold and why is it important?", a: "GroupKFold ensures that all rows belonging to the same group (patient, customer, device, store) are in the same fold. Without it, the model may see a patient's other X-rays during training and recognise the patient rather than the disease, giving optimistic scores that will not hold for new patients.", level: "Hard" },
    { q: "Grid search vs random search — which would you use?", a: "Grid search exhaustively tries all combinations; it's fine for a small grid of 1-2 parameters. Random search samples a fixed number of combinations from distributions; for larger spaces it finds equally good or better settings much faster because only a few hyperparameters usually matter, and it explores more distinct values for each. For expensive models, use successive halving or Bayesian optimisation (Optuna).", level: "Medium" },
    { q: "Explain the bias-variance trade-off.", a: "Total expected error = bias² + variance + irreducible error. Bias is error from overly simple assumptions (underfitting); variance is error from sensitivity to the training sample (overfitting). Making a model more complex reduces bias but increases variance. The goal is to find the complexity that minimises total error, typically using validation curves and regularisation.", level: "Medium" },
    { q: "How do you detect overfitting and underfitting?", a: "Compare training and validation performance. Overfitting: very good training score, much worse validation score (large gap). Underfitting: both scores poor and similar. Use learning curves and validation curves to diagnose and decide whether more data, more complexity or more regularisation is needed.", level: "Easy" },
    { q: "List techniques to reduce overfitting.", a: "Get more training data or augment it; simplify the model (fewer features, shallower trees); regularisation (L1/L2, smaller C, larger alpha); early stopping; dropout and weight decay for neural networks; ensembling (bagging); cross-validated hyperparameter tuning; removing leaky or noisy features.", level: "Easy" },
    { q: "Why is GridSearchCV's best_score_ not a reliable final performance estimate?", a: "It is the maximum of many noisy CV estimates, so it is optimistically biased (selection bias / winner's curse) — especially with large grids and small data. Report performance on an untouched test set or use nested cross-validation, where an outer loop evaluates the entire tuning procedure.", level: "Hard" },
    { q: "What does refit=True do in GridSearchCV?", a: "After finding the best hyperparameters using cross-validation, GridSearchCV retrains the estimator with those parameters on the entire training data passed to fit, and exposes it as best_estimator_. Calls like search.predict use this refitted model. With multiple scoring metrics you must set refit to the name of the metric used to select the best model.", level: "Medium" },
    { q: "What does a learning curve tell you that a validation curve does not?", a: "A learning curve shows performance versus training set size, telling you whether collecting more data will help (large gap that closes with more data = high variance) or not (both curves plateau at a low score = high bias). A validation curve shows performance versus a hyperparameter value, telling you the best model complexity.", level: "Medium" },
    { q: "Is it okay to do SMOTE or feature selection before cross-validation?", a: "No. Any step that learns from data — scaling, imputation, feature selection, oversampling, target encoding — must be fitted inside each training fold, otherwise information from validation folds leaks into training and inflates scores. Use a Pipeline (imblearn.pipeline.Pipeline for samplers) and pass it to cross-validation.", level: "Hard" },
  ],
  practice: [
    {
      task: "Use cross_validate on load_breast_cancer with a scaled LogisticRegression pipeline and 5-fold StratifiedKFold to report mean accuracy, precision, recall and ROC-AUC in one call. Also include training scores.",
      hint: "cross_validate(pipe, X, y, cv=cv, scoring=[...], return_train_score=True) returns a dict.",
      solution: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import cross_validate, StratifiedKFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X, y = load_breast_cancer(return_X_y=True)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
res = cross_validate(pipe, X, y, cv=cv, return_train_score=True,
                     scoring=["accuracy", "precision", "recall", "roc_auc"])
for k, v in res.items():
    if "test" in k or "train" in k:
        print(f"{k:16s} {v.mean():.3f}")
# Test accuracy ~0.98, ROC-AUC ~0.995; train scores only slightly higher → no big overfit.`,
    },
    {
      task: "Tune a KNN pipeline on load_wine with GridSearchCV over n_neighbors (1-15, odd) and weights ('uniform', 'distance'). Print best params and best CV accuracy.",
      hint: "Parameter names: 'kneighborsclassifier__n_neighbors' if you use make_pipeline.",
      solution: `from sklearn.datasets import load_wine
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

X, y = load_wine(return_X_y=True)
pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())
grid = {"kneighborsclassifier__n_neighbors": list(range(1, 16, 2)),
        "kneighborsclassifier__weights": ["uniform", "distance"]}
s = GridSearchCV(pipe, grid, cv=5).fit(X, y)
print(s.best_params_, round(s.best_score_, 4))
# Best is k=7, uniform, CV accuracy ~0.967. Tip: print pipe.get_params().keys() to see valid names.`,
    },
    {
      task: "Implement nested cross-validation: inner GridSearchCV (cv=3) tuning C of a scaled LogisticRegression over [0.01, 0.1, 1, 10], outer cross_val_score (cv=5) on load_breast_cancer. Print the outer mean and std.",
      hint: "Pass the GridSearchCV object itself as the estimator to cross_val_score.",
      solution: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import GridSearchCV, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X, y = load_breast_cancer(return_X_y=True)
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
inner = GridSearchCV(pipe, {"logisticregression__C": [0.01, 0.1, 1, 10]}, cv=3)
outer = cross_val_score(inner, X, y, cv=5)
print(round(outer.mean(), 4), round(outer.std(), 4))
# ~0.97-0.98. This number estimates the performance of 'LogReg + tuning procedure' without bias.`,
    },
    {
      task: "A model shows train accuracy 0.99 and validation accuracy 0.71. A second model shows 0.72 and 0.70. Diagnose each and suggest two fixes for each.",
      hint: "Look at the gap and the absolute level.",
      solution: "Model 1: large gap (0.99 vs 0.71) → high variance / overfitting. Fixes: regularise or simplify (e.g. lower max_depth, larger min_samples_leaf, smaller C), get more data, use bagging / early stopping, remove noisy features.\n\nModel 2: both scores low and close → high bias / underfitting. Fixes: use a more flexible model (e.g. gradient boosting instead of a linear model), engineer better features (interactions, domain features), reduce regularisation. More data alone will not help much.",
    },
  ],
  quiz: [
    { question: "In 5-fold CV, how many times is the model trained?", options: ["1", "4", "5", "10"], answer: 2, explanation: "Once per fold: 5 trainings, each validated on a different fold." },
    { question: "Which splitter should you use for monthly sales forecasting?", options: ["KFold with shuffle", "StratifiedKFold", "TimeSeriesSplit", "LeaveOneOut"], answer: 2, explanation: "Time-ordered data must train on the past and validate on the future." },
    { question: "Training accuracy 0.99, validation 0.70 indicates:", options: ["High bias", "High variance (overfitting)", "Perfect model", "Data imbalance only"], answer: 1, explanation: "A large train-validation gap is the signature of overfitting." },
    { question: "GridSearchCV with 3 values of C, 4 values of gamma and cv=5 fits how many models (excluding the final refit)?", options: ["12", "17", "60", "35"], answer: 2, explanation: "3 × 4 = 12 combinations × 5 folds = 60 fits." },
    { question: "If a learning curve shows both training and validation scores plateauing at a low value, you should:", options: ["Collect more data", "Use a more complex model / better features", "Add more regularisation", "Reduce training data"], answer: 1, explanation: "Converged low curves indicate high bias; more data will not help." },
    { question: "Nested cross-validation is used to:", options: ["Speed up training", "Get an unbiased estimate of performance including hyperparameter tuning", "Handle missing values", "Balance classes"], answer: 1, explanation: "The outer loop evaluates the whole tuning procedure tuned in the inner loop." },
  ],
};
