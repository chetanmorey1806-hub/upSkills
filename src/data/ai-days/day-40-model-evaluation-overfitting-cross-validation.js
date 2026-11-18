export default {
  id: "day-40-model-evaluation-overfitting-cross-validation",
  title: "Model Evaluation, Overfitting/Underfitting, Cross-validation and Feature Engineering",
  module: "Module 6: Machine Learning Hands-on",
  day: 40,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Learn what separates a toy model from a trustworthy one. Understand overfitting (memorising) and underfitting (too simple), the bias-variance trade-off, train/validation/test splits, k-fold cross-validation, hyperparameter tuning with GridSearchCV, data leakage and Pipelines. Then improve models the way professionals do - with feature engineering: creating better input columns from dates, ratios, bins and domain knowledge.",
  objectives: [
    "Recognise overfitting and underfitting by comparing training and test scores",
    "Explain the bias-variance trade-off with everyday analogies",
    "Use k-fold cross-validation and GridSearchCV to evaluate and tune models",
    "Prevent data leakage with scikit-learn Pipelines",
    "Create useful new features from dates, ratios, bins and text"
  ],
  theory: [
    {
      heading: "Overfitting and Underfitting",
      content: "A good model learns the general pattern, not the noise. Overfitting = memorising the training data, including its random noise - excellent training score, poor test score. Underfitting = the model is too simple to capture the pattern - poor scores on both. Analogy: a student who memorises last year's answer key (overfits) fails when questions change; a student who only read the chapter titles (underfits) fails everything; a student who understood the concepts (good fit) does well on new questions.",
      points: [
        "Overfitting signs: training accuracy ~100%, test accuracy much lower. Causes: model too complex (deep tree, K = 1), too little data, too many features.",
        "Underfitting signs: both scores low. Causes: model too simple (straight line for a curve), missing important features, too much regularisation.",
        "Fix overfitting: more data, simpler model (max_depth, larger K), regularisation, fewer/better features, ensembles, early stopping (neural networks), dropout.",
        "Fix underfitting: more complex model, better features, less regularisation, train longer.",
        "See it in the ML Playground (/tools/ml-playground): KNN with K = 1 draws islands around every noisy point (overfitting); a very large K washes everything into one colour (underfitting)."
      ]
    },
    {
      heading: "The Bias-Variance Trade-off",
      content: "Bias = error from wrong, overly simple assumptions (the model is consistently off target). Variance = error from being too sensitive to the particular training data (the model changes a lot if the data changes a little). Analogy: darts. High bias = all darts clustered but far from the bullseye. High variance = darts scattered all over the board. We want low bias AND low variance, but making a model more flexible lowers bias and raises variance - so we look for the sweet spot.",
      points: [
        "Simple models (linear regression, large K): high bias, low variance.",
        "Complex models (deep trees, K = 1, huge neural nets without regularisation): low bias, high variance.",
        "Ensembles help: Random Forest averages many high-variance trees to reduce variance; boosting adds models to reduce bias.",
        "More training data mostly reduces variance."
      ]
    },
    {
      heading: "Train / Validation / Test and k-fold Cross-validation",
      content: "If you tune settings (K, max_depth) by checking the test set again and again, the test set stops being 'unseen' - you indirectly fit to it. So we keep three roles: training data (learn), validation data (choose settings), test data (final, one-time check). With small datasets, k-fold cross-validation makes better use of the data: split into k folds, train on k-1 folds and validate on the remaining fold, rotate k times, average the scores.",
      syntax: `from sklearn.model_selection import cross_val_score, KFold, StratifiedKFold
scores = cross_val_score(model, X, y, cv=5)              # 5 scores, one per fold
print(scores.mean(), scores.std())                        # average and stability

cv = KFold(n_splits=4, shuffle=True, random_state=42)    # explicit folds
cv = StratifiedKFold(n_splits=5)                         # keeps class ratio in each fold`,
      points: [
        "Every row is used for validation exactly once and for training k-1 times.",
        "Report mean +- std: a high std means the score depends a lot on which rows are in the test fold.",
        "For classifiers, cv=5 uses StratifiedKFold automatically, keeping the class balance in each fold.",
        "Time series: use TimeSeriesSplit (always train on the past, validate on the future).",
        "Still keep a final untouched test set for the very last check."
      ]
    },
    {
      heading: "Hyperparameter Tuning with GridSearchCV",
      content: "Parameters are learned by the model (coefficients, tree thresholds). Hyperparameters are settings you choose before training (K in KNN, max_depth of a tree, C in logistic regression). GridSearchCV tries every combination with cross-validation and picks the best. Analogy: trying every oven temperature and baking time combination on test batches before the real cake.",
      syntax: `from sklearn.model_selection import GridSearchCV
from sklearn.tree import DecisionTreeClassifier
grid = GridSearchCV(DecisionTreeClassifier(random_state=0),
                    param_grid={"max_depth": [2, 3, 5, None], "min_samples_leaf": [1, 5]},
                    cv=5, scoring="f1")
grid.fit(X_train, y_train)
print(grid.best_params_, grid.best_score_)
best_model = grid.best_estimator_         # already refitted on all training data`,
      points: [
        "scoring chooses the metric to optimise: 'accuracy', 'f1', 'recall', 'neg_mean_absolute_error', 'r2'.",
        "RandomizedSearchCV samples random combinations - faster for big grids.",
        "Tuning on the test set is cheating - tune with cross-validation on training data only."
      ]
    },
    {
      heading: "Data Leakage and Pipelines",
      content: "Data leakage means information the model would not have at prediction time sneaks into training, producing unrealistically good scores that collapse in production. Analogy: a student who saw the exam paper the night before - top marks, no real skill.",
      syntax: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
model = make_pipeline(StandardScaler(), LogisticRegression())
cross_val_score(model, X, y, cv=5)   # scaler is fitted inside each training fold only - no leakage`,
      points: [
        "Preprocessing leakage: scaling/imputing using statistics from the whole dataset before splitting.",
        "Target leakage: a feature that is created after the outcome (e.g. 'refund_issued' when predicting fraud).",
        "Time leakage: using future data to predict the past.",
        "Duplicate leakage: the same customer appears in both train and test.",
        "Pipelines bundle preprocessing + model, so cross-validation and deployment apply exactly the same steps."
      ],
      tip: "If a score looks too good to be true (99.9% on a hard problem), hunt for leakage before celebrating."
    },
    {
      heading: "Feature Engineering: Better Inputs Beat Fancier Models",
      content: "Feature engineering means creating new input columns that make the pattern easier for the model to see. Often a simple model with great features beats a complex model with raw data. Analogy: a doctor does not look at your raw date of birth - they compute your age.",
      syntax: `df["total"] = df["price"] * df["qty"]                      # interaction / combination
df["month"] = df["order_date"].dt.month                     # date parts
df["is_weekend"] = (df["order_date"].dt.dayofweek >= 5).astype(int)
df["price_per_sqft"] = df["price"] / df["area"]             # ratio
df["size_band"] = pd.cut(df["total"], bins=[0, 300, 550, 1000], labels=["small", "medium", "large"])  # binning
df["log_income"] = np.log1p(df["income"])                   # tame skewed values
df["review_length"] = df["review"].str.len()                # simple text feature`,
      points: [
        "Domain knowledge is the best source of features - talk to the people who know the business.",
        "Feature selection: remove useless or duplicate features (feature_importances_ of trees, correlation checks, SelectKBest).",
        "Polynomial features (x^2, x*y) let linear models fit curves.",
        "For text and images, modern practice uses pre-trained embeddings (Day 12, Day 41) as features instead of hand-made ones.",
        "AI assistants are good at brainstorming feature ideas - but you must test each idea with cross-validation."
      ]
    }
  ],
  examples: [
    {
      title: "Spot Overfitting: KNN with K = 1 vs K = 5",
      scenario: "Students' study hours (X) and pass/fail (y) contain two noisy labels (4.6 hours passed, 5.3 hours failed). Compare training and test accuracy for K = 1 and K = 5.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code and click Run",
        "Compare the train and test accuracy of each K",
        "In the ML Playground (/tools/ml-playground) recreate a few noisy points and switch K between 1 and 5"
      ],
      code: `from sklearn.neighbors import KNeighborsClassifier

X = [[1.0], [6.2], [2.1], [7.4], [3.3], [8.1], [4.6], [5.3], [2.7], [6.8], [3.9], [7.9]]
y = [0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1]
X_test = [[1.6], [4.4], [5.5], [7.0]]
y_test = [0, 0, 1, 1]

for k in [1, 5]:
    model = KNeighborsClassifier(n_neighbors=k).fit(X, y)
    print("k =", k, "train acc:", round(model.score(X, y), 2),
          "test acc:", round(model.score(X_test, y_test), 2))`,
      python: {
        files: {
          "main.py": `from sklearn.neighbors import KNeighborsClassifier

X = [[1.0], [6.2], [2.1], [7.4], [3.3], [8.1], [4.6], [5.3], [2.7], [6.8], [3.9], [7.9]]
y = [0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1]
X_test = [[1.6], [4.4], [5.5], [7.0]]
y_test = [0, 0, 1, 1]

for k in [1, 5]:
    model = KNeighborsClassifier(n_neighbors=k).fit(X, y)
    print("k =", k, "train acc:", round(model.score(X, y), 2),
          "test acc:", round(model.score(X_test, y_test), 2))
`
        },
        stdin: ""
      },
      result: `k = 1 train acc: 1.0 test acc: 0.5
k = 5 train acc: 0.83 test acc: 1.0`,
      explanation: "With K = 1 every training point's nearest neighbour is itself, so training accuracy is a 'perfect' 1.0 - pure memorisation. On the test set, 4.4 hours copies the noisy 4.6 (pass) and 5.5 copies the noisy 5.3 (fail): 2 of 4 wrong = 0.5. With K = 5 the vote outweighs the noise: training accuracy drops to 0.83 (the two noisy points are outvoted by their neighbours, so they count as 'wrong'), but all 4 test points are right. Lower training score, higher test score = better generalisation."
    },
    {
      title: "4-fold Cross-validation",
      scenario: "Instead of trusting one split, evaluate KNN (K = 3) with 4-fold cross-validation on the same 12 rows.",
      steps: [
        "Open the Python IDE (/tools/python-ide)",
        "Paste the code and click Run",
        "Look at the four fold scores and their mean",
        "Change n_splits to 3 and run again - does the mean change?"
      ],
      code: `import numpy as np
from sklearn.model_selection import cross_val_score, KFold
from sklearn.neighbors import KNeighborsClassifier

X = [[1.0], [6.2], [2.1], [7.4], [3.3], [8.1], [4.6], [5.3], [2.7], [6.8], [3.9], [7.9]]
y = [0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1]

cv = KFold(n_splits=4)          # no shuffle: rows 0-2, 3-5, 6-8, 9-11 are the folds
scores = cross_val_score(KNeighborsClassifier(n_neighbors=3), X, y, cv=cv)
print("fold scores:", np.round(scores, 2).tolist())
print("mean CV accuracy:", round(float(scores.mean()), 2))`,
      python: {
        files: {
          "main.py": `import numpy as np
from sklearn.model_selection import cross_val_score, KFold
from sklearn.neighbors import KNeighborsClassifier

X = [[1.0], [6.2], [2.1], [7.4], [3.3], [8.1], [4.6], [5.3], [2.7], [6.8], [3.9], [7.9]]
y = [0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1]

cv = KFold(n_splits=4)          # no shuffle: rows 0-2, 3-5, 6-8, 9-11 are the folds
scores = cross_val_score(KNeighborsClassifier(n_neighbors=3), X, y, cv=cv)
print("fold scores:", np.round(scores, 2).tolist())
print("mean CV accuracy:", round(float(scores.mean()), 2))
`
        },
        stdin: ""
      },
      result: `fold scores: [1.0, 1.0, 0.33, 1.0]
mean CV accuracy: 0.83`,
      explanation: "Each fold of 3 rows is held out once while the other 9 rows train the model. Fold 3 (4.6, 5.3, 2.7) contains both noisy labels, which the model cannot predict from their neighbours, so only 1 of 3 is right (0.33). The mean (1 + 1 + 0.33 + 1) / 4 = 0.83 is a more honest estimate than any single split - and the low fold warns us that performance near the 4.5-5.5 hour boundary is shaky."
    },
    {
      title: "Feature Engineering with Pandas",
      scenario: "An online shop wants to predict order returns. Raw data has only order_date, price and qty. Create more useful features: total value, month, weekday name, weekend flag and order-size band.",
      steps: [
        "Open the Python IDE (/tools/python-ide)",
        "Paste the code and click Run",
        "Check each new column against the raw data",
        "Add your own feature: price_band = 'premium' if price >= 300 else 'regular'"
      ],
      code: `import pandas as pd

df = pd.DataFrame({
    "order_date": pd.to_datetime(["2026-01-03", "2026-01-05", "2026-02-14", "2026-02-16"]),
    "price": [120, 80, 500, 60],
    "qty":   [2, 5, 1, 10],
})
df["total"] = df["price"] * df["qty"]
df["month"] = df["order_date"].dt.month
df["weekday"] = df["order_date"].dt.day_name()
df["is_weekend"] = (df["order_date"].dt.dayofweek >= 5).astype(int)
df["size_band"] = pd.cut(df["total"], bins=[0, 300, 550, 1000], labels=["small", "medium", "large"])

print("total:", df["total"].tolist())
print("month:", df["month"].tolist())
print("weekday:", df["weekday"].tolist())
print("is_weekend:", df["is_weekend"].tolist())
print("size_band:", df["size_band"].astype(str).tolist())`,
      python: {
        files: {
          "main.py": `import pandas as pd

df = pd.DataFrame({
    "order_date": pd.to_datetime(["2026-01-03", "2026-01-05", "2026-02-14", "2026-02-16"]),
    "price": [120, 80, 500, 60],
    "qty":   [2, 5, 1, 10],
})
df["total"] = df["price"] * df["qty"]
df["month"] = df["order_date"].dt.month
df["weekday"] = df["order_date"].dt.day_name()
df["is_weekend"] = (df["order_date"].dt.dayofweek >= 5).astype(int)
df["size_band"] = pd.cut(df["total"], bins=[0, 300, 550, 1000], labels=["small", "medium", "large"])

print("total:", df["total"].tolist())
print("month:", df["month"].tolist())
print("weekday:", df["weekday"].tolist())
print("is_weekend:", df["is_weekend"].tolist())
print("size_band:", df["size_band"].astype(str).tolist())
`
        },
        stdin: ""
      },
      result: `total: [240, 400, 500, 600]
month: [1, 1, 2, 2]
weekday: ['Saturday', 'Monday', 'Saturday', 'Monday']
is_weekend: [1, 0, 1, 0]
size_band: ['small', 'medium', 'medium', 'large']`,
      explanation: "total = price x qty. 3 Jan 2026 and 14 Feb 2026 are Saturdays (dayofweek 5, Monday = 0), so is_weekend = 1. pd.cut uses right-inclusive bins (0, 300], (300, 550], (550, 1000]: 240 -> small, 400 and 500 -> medium, 600 -> large. A model can now learn patterns like 'weekend, large orders are returned more often' that it could never see in the raw date."
    },
    {
      title: "Pure-Python Overfitting and Cross-validation (Runs Anywhere)",
      scenario: "Re-implement 1-D KNN, the train/test comparison and 4-fold cross-validation by hand to see exactly what scikit-learn does.",
      steps: [
        "Open the Python IDE (/tools/python-ide) or any Python 3",
        "Paste the code and click Run",
        "Check that the numbers match the two scikit-learn examples",
        "Try k = 3 in the first loop and compare"
      ],
      code: `# Pure-Python: overfitting (k=1 vs k=5) and 4-fold cross-validation with KNN
X = [1.0, 6.2, 2.1, 7.4, 3.3, 8.1, 4.6, 5.3, 2.7, 6.8, 3.9, 7.9]
y = [0,   1,   0,   1,   0,   1,   1,   0,   0,   1,   0,   1]
X_test = [1.6, 4.4, 5.5, 7.0]
y_test = [0,   0,   1,   1]

def predict(train_x, train_y, x, k):
    order = sorted(range(len(train_x)), key=lambda i: abs(train_x[i] - x))
    votes = [train_y[i] for i in order[:k]]
    return 1 if votes.count(1) > votes.count(0) else 0

def accuracy(train_x, train_y, xs, ys, k):
    preds = [predict(train_x, train_y, v, k) for v in xs]
    return sum(p == t for p, t in zip(preds, ys)) / len(ys)

for k in (1, 5):
    print("k =", k, "train acc:", round(accuracy(X, y, X, y, k), 2),
          "test acc:", round(accuracy(X, y, X_test, y_test, k), 2))

scores = []
for f in range(4):                     # KFold(4) without shuffle: rows 0-2, 3-5, 6-8, 9-11
    test_idx = list(range(f * 3, f * 3 + 3))
    tr_x = [X[i] for i in range(12) if i not in test_idx]
    tr_y = [y[i] for i in range(12) if i not in test_idx]
    scores.append(round(accuracy(tr_x, tr_y, [X[i] for i in test_idx], [y[i] for i in test_idx], 3), 2))
print("fold scores (k=3):", scores)
print("mean CV accuracy:", round(sum(scores) / len(scores), 2))`,
      python: {
        files: {
          "main.py": `# Pure-Python: overfitting (k=1 vs k=5) and 4-fold cross-validation with KNN
X = [1.0, 6.2, 2.1, 7.4, 3.3, 8.1, 4.6, 5.3, 2.7, 6.8, 3.9, 7.9]
y = [0,   1,   0,   1,   0,   1,   1,   0,   0,   1,   0,   1]
X_test = [1.6, 4.4, 5.5, 7.0]
y_test = [0,   0,   1,   1]

def predict(train_x, train_y, x, k):
    order = sorted(range(len(train_x)), key=lambda i: abs(train_x[i] - x))
    votes = [train_y[i] for i in order[:k]]
    return 1 if votes.count(1) > votes.count(0) else 0

def accuracy(train_x, train_y, xs, ys, k):
    preds = [predict(train_x, train_y, v, k) for v in xs]
    return sum(p == t for p, t in zip(preds, ys)) / len(ys)

for k in (1, 5):
    print("k =", k, "train acc:", round(accuracy(X, y, X, y, k), 2),
          "test acc:", round(accuracy(X, y, X_test, y_test, k), 2))

scores = []
for f in range(4):                     # KFold(4) without shuffle: rows 0-2, 3-5, 6-8, 9-11
    test_idx = list(range(f * 3, f * 3 + 3))
    tr_x = [X[i] for i in range(12) if i not in test_idx]
    tr_y = [y[i] for i in range(12) if i not in test_idx]
    scores.append(round(accuracy(tr_x, tr_y, [X[i] for i in test_idx], [y[i] for i in test_idx], 3), 2))
print("fold scores (k=3):", scores)
print("mean CV accuracy:", round(sum(scores) / len(scores), 2))
`
        },
        stdin: ""
      },
      result: `k = 1 train acc: 1.0 test acc: 0.5
k = 5 train acc: 0.83 test acc: 1.0
fold scores (k=3): [1.0, 1.0, 0.33, 1.0]
mean CV accuracy: 0.83`,
      explanation: "Same numbers as scikit-learn. The CV loop is all cross_val_score does: hold out each fold in turn, train on the rest, score, and collect the results. (The mean here averages the rounded fold scores: (1 + 1 + 0.33 + 1)/4 = 0.8325, which still rounds to 0.83.)"
    },
    {
      title: "Use AI to Brainstorm Features (Then Test Them)",
      scenario: "You are predicting whether a gym member will cancel (churn) next month. Ask an AI assistant for feature ideas and leakage risks.",
      steps: [
        "Open the AI Prompt Lab (/tools/ai-lab) or claude.ai / ChatGPT / Gemini",
        "Paste the prompt below and run it",
        "Mark each suggested feature as 'available at prediction time' or 'leakage'",
        "Pick the 3 best ideas to test with cross-validation"
      ],
      code: `You are a senior data scientist.
Problem: predict whether a gym member cancels their membership next month.
Raw columns: member_id, join_date, plan_type, monthly_fee, checkin_timestamps (list), last_payment_date, payment_failures, age, city, cancellation_date.
Task:
1. Suggest 10 engineered features with a one-line reason each.
2. Identify any column or feature that would cause DATA LEAKAGE and explain why.
3. Recommend a validation strategy (which split / cross-validation).
Format: numbered lists, short and practical.`,
      prompt: {
        system: "You are a senior data scientist who is strict about data leakage and practical validation.",
        user: "Problem: predict whether a gym member cancels their membership next month.\nRaw columns: member_id, join_date, plan_type, monthly_fee, checkin_timestamps (list), last_payment_date, payment_failures, age, city, cancellation_date.\nTask:\n1. Suggest 10 engineered features with a one-line reason each.\n2. Identify any column or feature that would cause DATA LEAKAGE and explain why.\n3. Recommend a validation strategy (which split / cross-validation).\nFormat: numbered lists, short and practical."
      },
      result: "Feature ideas like: tenure in months, check-ins in the last 7/30 days, trend (last 30 days vs previous 30), days since last check-in, share of weekend visits, payment failures in the last 3 months, fee relative to plan average, contract renewal approaching. Leakage: cancellation_date (it is the answer itself) and any feature computed after the prediction date; member_id should be dropped. Validation: time-based split (train on earlier months, test on later months) or TimeSeriesSplit, with stratification awareness because churners are a minority.",
      explanation: "AI is great at brainstorming, and asking explicitly for leakage risks catches the most common beginner mistake. Every idea must still prove itself in cross-validation - keep the features that improve the CV score."
    }
  ],
  tools: [
    { name: "ML Playground", use: "See overfitting (K = 1) and underfitting (very large K) visually", url: "/tools/ml-playground" },
    { name: "In-app Python IDE", use: "Run cross-validation, GridSearchCV and feature engineering code", url: "/tools/python-ide" },
    { name: "scikit-learn", use: "cross_val_score, KFold, GridSearchCV, Pipeline", url: "https://scikit-learn.org" },
    { name: "AI Prompt Lab", use: "Brainstorm features and review evaluation plans with AI", url: "/tools/ai-lab" }
  ],
  interview: [
    { q: "What is overfitting and how do you detect it?", a: "The model learns noise in the training data and fails to generalise. Detect it by a large gap between training and validation/test scores (e.g. 99% train vs 75% test), or with learning curves.", level: "Easy" },
    { q: "How do you reduce overfitting?", a: "More data, simpler model or stronger regularisation (L1/L2, max_depth, larger K), feature selection, cross-validation for tuning, ensembles (bagging), early stopping and dropout for neural nets, data augmentation for images.", level: "Medium" },
    { q: "Explain the bias-variance trade-off.", a: "Total error comes from bias (wrong simplifying assumptions, underfitting) and variance (sensitivity to the training sample, overfitting) plus irreducible noise. Increasing model complexity lowers bias but raises variance; the best model balances them.", level: "Medium" },
    { q: "What is k-fold cross-validation and why use it?", a: "Split data into k folds; train on k-1 and validate on the remaining fold, rotating k times; average the scores. It uses all data for both training and validation and gives a more reliable estimate (with variance) than a single split.", level: "Easy" },
    { q: "What is the difference between a parameter and a hyperparameter?", a: "Parameters are learned from data during training (weights, coefficients, split thresholds). Hyperparameters are set before training and control the learning (K, max_depth, learning rate, C) and are tuned with validation/CV.", level: "Easy" },
    { q: "What is data leakage? Give examples.", a: "When training uses information unavailable at prediction time. Examples: scaling with full-dataset statistics before splitting, features created after the outcome (refund issued when predicting fraud), future data in time series, the same entity in train and test.", level: "Medium" },
    { q: "Why use a scikit-learn Pipeline?", a: "It chains preprocessing and the model so that, during cross-validation, preprocessing is fitted only on training folds (preventing leakage), and the exact same steps are applied at deployment. It also makes code cleaner and tunable with GridSearchCV.", level: "Medium" },
    { q: "When would you use StratifiedKFold or TimeSeriesSplit?", a: "StratifiedKFold for classification, especially imbalanced data, so each fold keeps the class ratio. TimeSeriesSplit for time-ordered data so validation always comes after training in time.", level: "Medium" },
    { q: "What is feature engineering? Give three examples.", a: "Creating informative inputs from raw data: date parts and 'days since last purchase' from timestamps; ratios like price per square foot; aggregations like average spend in the last 30 days; binning; log transforms; text length or embeddings.", level: "Easy" },
    { q: "GridSearchCV vs RandomizedSearchCV?", a: "Grid search tries every combination - thorough but slow for big grids. Randomized search samples a fixed number of random combinations - much faster and often finds equally good settings when only a few hyperparameters matter.", level: "Hard" },
    { q: "Your model has 99.8% accuracy on a hard problem. What do you check?", a: "Class imbalance (is accuracy meaningful?), data leakage (target-derived or future features, duplicates across splits), whether evaluation used the training data, and whether the test set represents production data.", level: "Hard" }
  ],
  practice: [
    {
      task: "Train DecisionTreeClassifier with max_depth = 1, 3 and None on the breast cancer dataset (from sklearn.datasets import load_breast_cancer) using train_test_split(test_size=0.3, random_state=42). Print train and test accuracy for each depth and label each as underfit, good or overfit.",
      hint: "Loop over [1, 3, None]; use model.score on both sets.",
      solution: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42)
for d in [1, 3, None]:
    m = DecisionTreeClassifier(max_depth=d, random_state=0).fit(X_tr, y_tr)
    print(d, round(m.score(X_tr, y_tr), 3), round(m.score(X_te, y_te), 3))
# Expect: depth None -> train 1.0 with a lower test score (overfit); depth 1 -> lower on both (simpler); depth 3 -> good balance`
    },
    {
      task: "Use GridSearchCV to find the best n_neighbors (1 to 15, odd numbers) for KNN on the Iris dataset with cv=5, inside a Pipeline with StandardScaler.",
      hint: "Parameter names in a pipeline use the step name: 'kneighborsclassifier__n_neighbors'.",
      solution: `from sklearn.datasets import load_iris
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
X, y = load_iris(return_X_y=True)
pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())
grid = GridSearchCV(pipe, {"kneighborsclassifier__n_neighbors": list(range(1, 16, 2))}, cv=5)
grid.fit(X, y)
print(grid.best_params_, round(grid.best_score_, 3))   # a mid-range K with CV accuracy around 0.95`
    },
    {
      task: "List 6 features you would engineer to predict taxi trip duration from: pickup_time, pickup_lat, pickup_lon, drop_lat, drop_lon, passenger_count.",
      hint: "Think about distance, time of day and day of week.",
      solution: "1) straight-line (haversine) distance; 2) hour of day; 3) is_rush_hour flag; 4) day of week / is_weekend; 5) direction (bearing) of travel; 6) pickup/drop area cluster (k-means on coordinates, from Day 39) or airport flag."
    },
    {
      task: "Open the ML Playground (/tools/ml-playground). Create a dataset with a few deliberately wrong-coloured points. Find a K value that ignores the noise but still follows the true boundary. Explain your choice in two sentences.",
      hint: "Try K = 1, 3, 7, 15 and watch the islands disappear without losing the real border.",
      solution: "K = 1 builds islands around each noisy point (overfitting). Around K = 5-7 the islands vanish while the main boundary stays in place; at very large K the boundary drifts toward the majority class (underfitting). The best K balances these - which is exactly what cross-validation measures numerically."
    },
    {
      task: "Ask an AI assistant to review this plan and find the leakage: 'I standardised all 10,000 rows, then split 80/20, then tuned max_depth by checking the test accuracy 30 times, and reported the best test accuracy.'",
      hint: "There are two problems.",
      solution: "Problem 1: scaling before splitting leaks test statistics into training (fit the scaler inside a Pipeline on training data only). Problem 2: tuning on the test set 30 times turns it into a validation set, so the reported score is optimistic; tune with cross-validation on the training set and use the test set once at the end."
    }
  ],
  quiz: [
    {
      question: "Train accuracy 99%, test accuracy 70%. This is most likely...",
      options: ["Underfitting", "Overfitting", "A perfect model", "Data cleaning"],
      answer: 1,
      explanation: "A large gap between training and test scores is the classic sign of overfitting."
    },
    {
      question: "In 5-fold cross-validation, how many times is the model trained?",
      options: ["1", "4", "10", "5"],
      answer: 3,
      explanation: "Once per fold - 5 times, each time holding out a different fold."
    },
    {
      question: "Which of these is a hyperparameter?",
      options: ["max_depth of a decision tree", "The learned coefficient of a feature", "The predicted label", "The intercept of a linear regression"],
      answer: 0,
      explanation: "max_depth is chosen before training; the others are learned or produced by the model."
    },
    {
      question: "Fitting a StandardScaler on the full dataset before the train/test split causes...",
      options: ["Underfitting", "Faster training", "Data leakage", "Class imbalance"],
      answer: 2,
      explanation: "Test-set statistics influence training. Fit preprocessing on training data only (Pipelines do this automatically)."
    },
    {
      question: "Which is an example of feature engineering?",
      options: ["Choosing K = 5", "Creating 'days_since_last_order' from order dates", "Calculating the F1-score", "Splitting data into folds"],
      answer: 1,
      explanation: "Creating new informative inputs from raw columns is feature engineering."
    }
  ]
};
