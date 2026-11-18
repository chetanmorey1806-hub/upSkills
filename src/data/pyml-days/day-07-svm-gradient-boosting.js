export default {
  id: "day-07-svm-gradient-boosting",
  title: "Support Vector Machines and Gradient Boosting (GradientBoosting, HistGradientBoosting, XGBoost, LightGBM)",
  module: "Module 2: Supervised Learning",
  day: 7,
  level: "Intermediate",
  duration: "3 hours",
  summary: "SVMs find the widest possible margin between classes and use kernels to draw curved boundaries. Gradient boosting builds trees one after another, each fixing the previous errors — the technique behind most winning solutions on tabular data. Learn how both work, their key hyperparameters, and how XGBoost, LightGBM and CatBoost relate to scikit-learn's boosting.",
  objectives: [
    "Explain maximum-margin classification, support vectors and the soft-margin parameter C",
    "Use the kernel trick (linear, polynomial, RBF) and tune C and gamma",
    "Explain boosting vs bagging and how gradient boosting fits residuals",
    "Train GradientBoosting and HistGradientBoosting models with early stopping",
    "Describe XGBoost, LightGBM and CatBoost and when to use each",
  ],
  theory: [
    {
      heading: "SVM Intuition: the Widest Street",
      content: "Imagine two groups of points that can be separated by many different lines. Which line is best? An SVM chooses the one with the **largest margin** — the widest 'street' between the classes. A wide margin means the boundary is far from the training points, so it generalises better to new points.\n\nThe points lying on the edges of the street are the **support vectors**. Only they determine the boundary; you could delete all other points and get the same model. Mathematically, the boundary is `w·x + b = 0`, the margin width is `2 / ||w||`, so maximising the margin = minimising ||w||² subject to every point being on the correct side.",
    },
    {
      heading: "Soft Margin and the C Parameter",
      content: "Real data overlaps, so a perfect street is impossible. A **soft-margin** SVM allows some points inside the margin or misclassified, paying a penalty (hinge loss) for each. **C** controls the trade-off:\n\n**Large C** → heavy penalty for violations → narrow margin that tries to classify every training point correctly → low bias, high variance (overfitting risk).\n\n**Small C** → tolerate violations → wider, smoother margin → more regularisation (underfitting risk).",
      syntax: `minimise  ½||w||² + C · Σ max(0, 1 − yᵢ(w·xᵢ + b))     # hinge loss`,
      tip: "C in SVM and C in LogisticRegression both mean 'inverse of regularisation strength'.",
    },
    {
      heading: "The Kernel Trick",
      content: "If the classes form a circle inside a ring, no straight line separates them. Mapping each point to a higher-dimensional space (e.g. add x² + y²) makes them linearly separable there. The **kernel trick** computes similarities in that high-dimensional space without ever creating the features explicitly.\n\n**Linear kernel**: plain dot product — fast, good for text with many features. **Polynomial kernel**: (γ·x·z + r)^d. **RBF (Gaussian) kernel**: exp(−γ·||x − z||²) — default and most flexible.\n\n**gamma** (RBF): how far the influence of one training point reaches. Large gamma → each point only influences a tiny area → very wiggly boundary (overfitting). Small gamma → smooth boundary.",
      points: [
        "SVMs need feature scaling (distance and dot-product based)",
        "SVC training is roughly O(n²)–O(n³): great up to ~10-50k rows, slow beyond; use LinearSVC or SGDClassifier for large data",
        "SVC gives no probabilities by default; probability=True uses slower internal cross-validation (Platt scaling)",
        "SVR is the regression version with an ε-insensitive tube",
      ],
    },
    {
      heading: "Boosting: Learning from Mistakes",
      content: "**Bagging** (random forest) trains trees **in parallel**, independently, and averages them → reduces variance. **Boosting** trains weak learners (usually shallow trees) **sequentially**: each new model focuses on the errors of the ensemble so far → reduces bias (and variance with care).\n\n**AdaBoost** re-weights misclassified samples. **Gradient Boosting** fits each new tree to the **negative gradient of the loss** — for squared error, that is simply the **residuals** (y − current prediction). Prediction = initial guess + η·tree₁ + η·tree₂ + …, where η is the **learning rate**.",
      syntax: `F0(x) = mean(y)
for m in 1..M:
    residual = y − F(m−1)(x)          # negative gradient of MSE
    fit small tree h_m to residual
    F_m(x) = F(m−1)(x) + learning_rate · h_m(x)`,
    },
    {
      heading: "Key Hyperparameters and Early Stopping",
      content: "**n_estimators / max_iter**: number of boosting rounds. Unlike random forests, too many rounds **can overfit**. **learning_rate**: shrinks each tree's contribution; smaller (0.01–0.1) generalises better but needs more trees. **max_depth / max_leaf_nodes**: tree size (3–8 levels typical). **subsample** < 1.0 → stochastic gradient boosting (adds randomness, reduces overfitting). Regularisation: min_samples_leaf, l2_regularization.\n\n**Early stopping**: hold out a validation fraction and stop adding trees when the validation score stops improving for n_iter_no_change rounds — sets n_estimators automatically.\n\n`HistGradientBoostingClassifier/Regressor` bins features into ≤ 255 histogram buckets (like LightGBM), making it **much faster on large data**, supports **missing values natively** and categorical features (categorical_features='from_dtype'). Prefer it over GradientBoosting for > 10k rows.",
    },
    {
      heading: "XGBoost, LightGBM and CatBoost",
      content: "These are separate, highly optimised gradient boosting libraries that dominate Kaggle and industry tabular ML. They all follow the sklearn API (`XGBClassifier().fit(X, y)`).",
      points: [
        "XGBoost: second-order gradients (Newton boosting), built-in L1/L2 regularisation, level-wise tree growth, handles NaN, GPU support",
        "LightGBM (Microsoft): histogram binning + leaf-wise growth (splits the leaf with max gain) → very fast on large data; tune num_leaves; can overfit small data",
        "CatBoost (Yandex): ordered target statistics for categorical features without leakage, symmetric trees, great defaults",
        "Typical choice: start with HistGradientBoosting or LightGBM; use CatBoost when you have many categorical columns",
        "Neither is available in the browser runner here — install with pip install xgboost lightgbm catboost",
      ],
      tip: "Interview line: 'For tabular data, gradient-boosted trees are usually the strongest baseline; deep learning wins mainly on images, text and audio.'",
    },
  ],
  examples: [
    {
      title: "Linear vs RBF Kernel on Circular Data",
      scenario: "Points of one class form a circle inside a ring of the other class. Show why a linear SVM fails and an RBF kernel succeeds.",
      steps: [
        "Generate data with make_circles",
        "Train SVC with kernel='linear' and kernel='rbf' (scaled)",
        "Compare test accuracy and number of support vectors",
      ],
      code: `from sklearn.datasets import make_circles
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X, y = make_circles(n_samples=500, noise=0.1, factor=0.4, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42)

for kernel in ["linear", "rbf"]:
    m = make_pipeline(StandardScaler(), SVC(kernel=kernel, C=1.0)).fit(X_tr, y_tr)
    print(f"{kernel:6s} test acc={m.score(X_te, y_te):.3f} "
          f"support vectors={m[-1].n_support_.sum()}")
`,
      python: { files: { "main.py": `from sklearn.datasets import make_circles
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X, y = make_circles(n_samples=500, noise=0.1, factor=0.4, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42)

for kernel in ["linear", "rbf"]:
    m = make_pipeline(StandardScaler(), SVC(kernel=kernel, C=1.0)).fit(X_tr, y_tr)
    print(f"{kernel:6s} test acc={m.score(X_te, y_te):.3f} "
          f"support vectors={m[-1].n_support_.sum()}")
` } },
      result: "linear test acc=0.607 support vectors=350\nrbf    test acc=1.000 support vectors=45",
      explanation: "No straight line can separate a circle from the ring around it, so the linear SVM is near chance level and needs most points as support vectors. The RBF kernel implicitly maps points to a space where they become separable and achieves near-perfect accuracy with far fewer support vectors.",
    },
    {
      title: "Effect of C and gamma",
      scenario: "Tune an RBF SVM on breast cancer data and observe overfitting when gamma is too large.",
      steps: [
        "Build a scaled SVC pipeline",
        "Loop over a few (C, gamma) pairs",
        "Compare train and test accuracy",
      ],
      code: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

for C, gamma in [(0.01, "scale"), (1, "scale"), (100, "scale"), (1, 1.0), (100, 10.0)]:
    m = make_pipeline(StandardScaler(), SVC(C=C, gamma=gamma)).fit(X_tr, y_tr)
    print(f"C={C:<5} gamma={str(gamma):<6} train={m.score(X_tr, y_tr):.3f} test={m.score(X_te, y_te):.3f}")
`,
      python: { files: { "main.py": `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

for C, gamma in [(0.01, "scale"), (1, "scale"), (100, "scale"), (1, 1.0), (100, 10.0)]:
    m = make_pipeline(StandardScaler(), SVC(C=C, gamma=gamma)).fit(X_tr, y_tr)
    print(f"C={C:<5} gamma={str(gamma):<6} train={m.score(X_tr, y_tr):.3f} test={m.score(X_te, y_te):.3f}")
` } },
      result: "C=0.01  gamma=scale  train=0.627 test=0.629\nC=1     gamma=scale  train=0.979 test=0.979\nC=100   gamma=scale  train=1.000 test=0.944\nC=1     gamma=1.0    train=1.000 test=0.629\nC=100   gamma=10.0   train=1.000 test=0.629",
      explanation: "Very small C over-regularises (underfits). gamma='scale' (1 / (n_features · X.var())) is a sensible default. With a large gamma, each support vector influences only a tiny neighbourhood: training accuracy hits 100% while test accuracy collapses towards predicting the majority class — classic overfitting.",
    },
    {
      title: "Gradient Boosting from Scratch (Residual Fitting)",
      scenario: "Understand boosting by fitting shallow regression trees to residuals by hand, and compare with sklearn's GradientBoostingRegressor.",
      steps: [
        "Start with the mean prediction",
        "Repeatedly fit a depth-2 tree to residuals and add learning_rate × its prediction",
        "Track the training MSE as trees are added",
        "Compare with GradientBoostingRegressor using the same settings",
      ],
      code: `import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error

X, y = load_diabetes(return_X_y=True)
lr, n_trees = 0.1, 100
pred = np.full(len(y), y.mean())
for m in range(1, n_trees + 1):
    residual = y - pred
    tree = DecisionTreeRegressor(max_depth=2, random_state=0).fit(X, residual)
    pred += lr * tree.predict(X)
    if m in (1, 10, 50, 100):
        print(f"after {m:3d} trees: train MSE={mean_squared_error(y, pred):.1f}")

gb = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=2,
                               random_state=0).fit(X, y)
print("sklearn GB train MSE:", round(mean_squared_error(y, gb.predict(X)), 1))
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error

X, y = load_diabetes(return_X_y=True)
lr, n_trees = 0.1, 100
pred = np.full(len(y), y.mean())
for m in range(1, n_trees + 1):
    residual = y - pred
    tree = DecisionTreeRegressor(max_depth=2, random_state=0).fit(X, residual)
    pred += lr * tree.predict(X)
    if m in (1, 10, 50, 100):
        print(f"after {m:3d} trees: train MSE={mean_squared_error(y, pred):.1f}")

gb = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=2,
                               random_state=0).fit(X, y)
print("sklearn GB train MSE:", round(mean_squared_error(y, gb.predict(X)), 1))
` } },
      result: "after   1 trees: train MSE=5441.6\nafter  10 trees: train MSE=3378.9\nafter  50 trees: train MSE=2182.8\nafter 100 trees: train MSE=1814.1\nsklearn GB train MSE: 1814.1",
      explanation: "Each tree learns what the current ensemble still gets wrong, so the training error falls steadily. Our 10-line loop reproduces sklearn's GradientBoostingRegressor almost exactly — for squared error, the negative gradient is precisely the residual. In practice you watch validation error, not training error, to decide when to stop.",
    },
    {
      title: "HistGradientBoosting with Early Stopping and Missing Values",
      scenario: "Train a fast histogram-based booster on 20,000 rows that contain missing values, letting early stopping choose the number of trees.",
      steps: [
        "Generate data and inject 10% NaN values (no imputation needed)",
        "Fit HistGradientBoostingClassifier with early_stopping=True",
        "Inspect n_iter_ and compare with a random forest",
      ],
      code: `import time
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.pipeline import make_pipeline

X, y = make_classification(n_samples=20000, n_features=20, n_informative=10,
                           random_state=42)
rng = np.random.default_rng(42)
X[rng.random(X.shape) < 0.10] = np.nan
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)

t0 = time.perf_counter()
hgb = HistGradientBoostingClassifier(max_iter=1000, learning_rate=0.1,
                                     early_stopping=True, validation_fraction=0.1,
                                     n_iter_no_change=20, random_state=42).fit(X_tr, y_tr)
print(f"HGB: trees used={hgb.n_iter_} test acc={hgb.score(X_te, y_te):.3f}")

rf = make_pipeline(SimpleImputer(strategy="median"),
                   RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=42))
print(f"RF (needs imputation): test acc={rf.fit(X_tr, y_tr).score(X_te, y_te):.3f}")
`,
      python: { files: { "main.py": `import time
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.pipeline import make_pipeline

X, y = make_classification(n_samples=20000, n_features=20, n_informative=10,
                           random_state=42)
rng = np.random.default_rng(42)
X[rng.random(X.shape) < 0.10] = np.nan
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)

t0 = time.perf_counter()
hgb = HistGradientBoostingClassifier(max_iter=1000, learning_rate=0.1,
                                     early_stopping=True, validation_fraction=0.1,
                                     n_iter_no_change=20, random_state=42).fit(X_tr, y_tr)
print(f"HGB: trees used={hgb.n_iter_} test acc={hgb.score(X_te, y_te):.3f}")

rf = make_pipeline(SimpleImputer(strategy="median"),
                   RandomForestClassifier(n_estimators=200, n_jobs=-1, random_state=42))
print(f"RF (needs imputation): test acc={rf.fit(X_tr, y_tr).score(X_te, y_te):.3f}")
` } },
      result: "HGB: trees used=253 test acc=0.948\nRF (needs imputation): test acc=0.933",
      explanation: "HistGradientBoosting handles NaN natively by learning which side of each split missing values should go. Early stopping halted training long before 1000 iterations once the validation score stopped improving. Boosting typically edges out the random forest on this kind of data.",
    },
    {
      title: "XGBoost and LightGBM: the Same API (Concept Code)",
      scenario: "How you would train XGBoost and LightGBM in a real project on your laptop. These libraries are not available in the browser runner, so there is no Run button for this example.",
      steps: [
        "pip install xgboost lightgbm",
        "Create models with sklearn-style constructors",
        "Pass a validation set for early stopping",
        "Compare test scores and use the best",
      ],
      code: `# Run locally after: pip install xgboost lightgbm
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier, early_stopping

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

xgb = XGBClassifier(n_estimators=1000, learning_rate=0.05, max_depth=4,
                    subsample=0.8, colsample_bytree=0.8, reg_lambda=1.0,
                    early_stopping_rounds=50, eval_metric="logloss", random_state=42)
xgb.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], verbose=False)
print("XGB best iteration:", xgb.best_iteration, "acc:", xgb.score(X_val, y_val))

lgbm = LGBMClassifier(n_estimators=1000, learning_rate=0.05, num_leaves=31,
                      subsample=0.8, subsample_freq=1, colsample_bytree=0.8,
                      random_state=42, verbose=-1)
lgbm.fit(X_tr, y_tr, eval_set=[(X_val, y_val)],
         callbacks=[early_stopping(50, verbose=False)])
print("LGBM best iteration:", lgbm.best_iteration_, "acc:", lgbm.score(X_val, y_val))
`,
      result: "Approximately: both models stop early (somewhere around 100-400 iterations) and reach about 0.95-0.97 validation accuracy. Exact numbers depend on library versions.",
      explanation: "Both libraries copy the sklearn interface, so they plug into Pipelines, cross_val_score and GridSearchCV. Key ideas: a small learning_rate with many trees plus early stopping, row and column subsampling for regularisation, and tree size controlled by max_depth (XGBoost) or num_leaves (LightGBM, leaf-wise growth).",
    },
  ],
  interview: [
    { q: "What are support vectors?", a: "Support vectors are the training points that lie on or inside the margin (or are misclassified in a soft-margin SVM). They alone define the decision boundary; removing any other point does not change the model. The model's complexity depends on how many support vectors it has.", level: "Easy" },
    { q: "Explain the role of C in an SVM.", a: "C is the penalty for margin violations (inverse of regularisation). Large C tries hard to classify every training point correctly, producing a narrow margin and risk of overfitting. Small C allows more violations for a wider margin and a smoother, more regularised boundary that may underfit. Tune C with cross-validation.", level: "Medium" },
    { q: "What is the kernel trick?", a: "Many algorithms (like SVM) only need dot products between samples. A kernel function K(x, z) computes the dot product of the samples after a mapping φ to a higher (even infinite) dimensional space, without computing φ explicitly. This allows non-linear decision boundaries at the cost of a linear one. Common kernels: linear, polynomial, RBF, sigmoid.", level: "Medium" },
    { q: "What does gamma control in an RBF SVM?", a: "gamma defines how far the influence of a single training example reaches: K = exp(−γ||x − z||²). High gamma → narrow influence → very complex, wiggly boundaries that overfit. Low gamma → broad influence → smoother boundaries that may underfit. C and gamma interact and are usually tuned together with a log-scale grid.", level: "Medium" },
    { q: "When would you not use an SVM?", a: "On very large datasets (hundreds of thousands of rows) because kernel SVM training scales between O(n²) and O(n³) in time and needs O(n²) memory for the kernel matrix; when you need well-calibrated probabilities or easy interpretability; and with lots of noise and overlapping classes. Use LinearSVC/SGDClassifier or gradient boosting instead.", level: "Medium" },
    { q: "Difference between bagging and boosting?", a: "Bagging trains models independently in parallel on bootstrap samples and averages them; it reduces variance (e.g. random forest with deep trees). Boosting trains models sequentially, each correcting the errors of the previous ensemble; it mainly reduces bias using weak learners (shallow trees), and can overfit if run too long. Bagging is easier to parallelise; boosting is usually more accurate when tuned.", level: "Easy" },
    { q: "How does gradient boosting work?", a: "It starts with a constant prediction, then iteratively adds weak learners. At each step it computes the negative gradient of the loss with respect to the current predictions (for MSE these are the residuals), fits a small regression tree to those values, and adds it to the ensemble multiplied by a learning rate. This is gradient descent in function space.", level: "Medium" },
    { q: "What is the role of the learning rate in gradient boosting and how does it interact with n_estimators?", a: "The learning rate (shrinkage) scales each tree's contribution. A smaller learning rate makes each step more conservative, which usually improves generalisation but requires more trees. They trade off: halving the learning rate roughly needs doubling the trees. Practical recipe: set a small learning rate (0.05) with many trees and use early stopping.", level: "Medium" },
    { q: "Why is XGBoost so popular? What makes it different from basic gradient boosting?", a: "XGBoost uses second-order (Newton) approximation of the loss, explicit L1/L2 regularisation on leaf weights and a penalty on the number of leaves, sparsity-aware split finding that handles missing values, column and row subsampling, parallelised and cache-aware split search, out-of-core computation and GPU support. The result is fast, accurate and robust out of the box.", level: "Hard" },
    { q: "LightGBM vs XGBoost — what is leaf-wise growth?", a: "XGBoost traditionally grows trees level-wise (all nodes at one depth before the next). LightGBM grows leaf-wise: it always splits the leaf with the largest loss reduction, producing deeper, unbalanced trees that reduce loss faster. Combined with histogram binning and GOSS sampling, LightGBM is very fast on large data but can overfit small datasets; control it with num_leaves, min_data_in_leaf and max_depth.", level: "Hard" },
    { q: "When would you pick HistGradientBoosting over GradientBoosting in sklearn?", a: "Almost always for datasets above ~10,000 rows. HistGradientBoosting bins continuous features into at most 255 bins, making split finding orders of magnitude faster, supports missing values and categorical features natively, and has built-in early stopping. GradientBoosting is exact but slow, and is fine for small datasets or teaching.", level: "Medium" },
    { q: "Can a gradient boosting model overfit by adding more trees? Can a random forest?", a: "Yes, gradient boosting can overfit because each new tree keeps fitting the remaining residuals, including noise; use early stopping, a smaller learning rate, subsampling and shallow trees. A random forest generally does not overfit more as you add trees — its test error plateaus — although individual deep trees can still overfit, which max_depth/min_samples_leaf control.", level: "Hard" },
  ],
  practice: [
    {
      task: "Train SVC with kernel='linear', 'poly' (degree=3) and 'rbf' on make_moons(n_samples=500, noise=0.2, random_state=0) inside a scaling pipeline. Report test accuracy for each.",
      hint: "Same loop as Example 1 with an extra kernel.",
      solution: `from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X, y = make_moons(n_samples=500, noise=0.2, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)
for k in ["linear", "poly", "rbf"]:
    m = make_pipeline(StandardScaler(), SVC(kernel=k, degree=3)).fit(X_tr, y_tr)
    print(k, round(m.score(X_te, y_te), 3))
# Linear ~0.83, poly ~0.84, RBF ~0.95 (moons need a curved boundary).`,
    },
    {
      task: "Use GradientBoostingClassifier on load_breast_cancer with learning_rate in [0.01, 0.1, 1.0] (n_estimators=200, max_depth=3). Print test accuracy for each and explain the pattern.",
      hint: "A learning rate of 1.0 takes big steps; 0.01 with only 200 trees may not have learned enough.",
      solution: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
for lr in [0.01, 0.1, 1.0]:
    gb = GradientBoostingClassifier(n_estimators=200, learning_rate=lr, max_depth=3,
                                    random_state=42).fit(X_tr, y_tr)
    print(lr, round(gb.score(X_te, y_te), 3))
# About 0.937 (0.01), 0.958 (0.1) and 0.958 (1.0). With only 200 trees, 0.01 has not
# finished learning; 1.0 happens to do well on this easy data but is risky in general
# because big steps fit noise quickly. 0.1 + early stopping is a good default.`,
    },
    {
      task: "Use staged_predict of GradientBoostingRegressor (n_estimators=500, learning_rate=0.1, max_depth=3) on load_diabetes to find the number of trees with the lowest TEST MSE.",
      hint: "staged_predict yields predictions after 1, 2, ..., n trees. Use np.argmin.",
      solution: `import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error

X, y = load_diabetes(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
gb = GradientBoostingRegressor(n_estimators=500, learning_rate=0.1, max_depth=3,
                               random_state=42).fit(X_tr, y_tr)
errors = [mean_squared_error(y_te, p) for p in gb.staged_predict(X_te)]
best = int(np.argmin(errors)) + 1
print("best number of trees:", best, "MSE:", round(errors[best - 1], 1))
print("MSE with all 500 trees:", round(errors[-1], 1))
# Best is around 38 trees (MSE ~2789) vs ~3271 with all 500: later trees overfit.
# (Use a validation set, not the test set, for this choice in real projects.)`,
    },
    {
      task: "Explain in 4-5 lines to a non-technical manager the difference between a random forest and gradient boosting, using a 'committee of experts' analogy.",
      hint: "Independent experts voting vs experts who learn from each other's mistakes in turn.",
      solution: "Random forest: we ask 300 experts, each of whom studied a slightly different sample of past cases, to vote independently; their individual mistakes average out. Gradient boosting: we ask experts one at a time; each new expert studies only the cases the team is still getting wrong and adds a small correction. The forest is robust and easy to set up; boosting is usually a bit more accurate but needs careful tuning (learning rate, number of experts) so it does not start memorising noise.",
    },
  ],
  quiz: [
    { question: "In an SVM, which points determine the decision boundary?", options: ["All training points", "Only the support vectors", "Only misclassified points", "The class centroids"], answer: 1, explanation: "Only points on or within the margin (support vectors) affect the solution." },
    { question: "A very large gamma in an RBF SVM tends to cause:", options: ["Underfitting", "Overfitting", "A linear boundary", "Faster training only"], answer: 1, explanation: "Large gamma makes each point's influence very local, producing an overly complex boundary." },
    { question: "Gradient boosting with squared-error loss fits each new tree to:", options: ["The original target y", "The residuals of the current ensemble", "Random noise", "The class probabilities"], answer: 1, explanation: "The negative gradient of MSE with respect to predictions is the residual y − F(x)." },
    { question: "Boosting primarily reduces ___, while bagging primarily reduces ___.", options: ["variance, bias", "bias, variance", "bias, bias", "variance, variance"], answer: 1, explanation: "Boosting sequentially corrects bias of weak learners; bagging averages away variance." },
    { question: "Which sklearn model natively handles NaN values and is fast on large tabular data?", options: ["SVC", "GradientBoostingClassifier", "HistGradientBoostingClassifier", "KNeighborsClassifier"], answer: 2, explanation: "HistGradientBoosting bins features and learns where to send missing values." },
    { question: "LightGBM's distinctive tree-growth strategy is:", options: ["Level-wise", "Leaf-wise (best-first)", "Random", "Symmetric (oblivious) trees"], answer: 1, explanation: "LightGBM splits the leaf with the largest loss reduction; CatBoost uses symmetric trees." },
  ],
};
