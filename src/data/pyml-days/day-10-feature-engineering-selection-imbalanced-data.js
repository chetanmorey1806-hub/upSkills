export default {
  id: "day-10-feature-engineering-selection-imbalanced-data",
  title: "Feature Engineering, Feature Selection and Imbalanced Data (class_weight, SMOTE)",
  module: "Module 3: Unsupervised & Model Quality",
  day: 10,
  level: "Advanced",
  duration: "3 hours",
  summary: "Better features usually beat better algorithms. Learn practical feature engineering (dates, ratios, binning, log transforms, interactions, text and aggregate features), feature selection methods (filter, wrapper, embedded), and how to handle imbalanced classification with the right metrics, class weights, resampling and SMOTE.",
  objectives: [
    "Create useful features from dates, ratios, groups, skewed numbers and interactions",
    "Apply filter, wrapper and embedded feature selection in scikit-learn",
    "Explain why imbalanced data breaks accuracy and default thresholds",
    "Use class_weight='balanced', undersampling, oversampling and SMOTE correctly",
    "Avoid leakage when engineering features, selecting features and resampling",
  ],
  theory: [
    {
      heading: "What is Feature Engineering?",
      content: "Feature engineering means using domain knowledge to create inputs that make patterns easier for a model to learn. A linear model cannot discover that 'loan amount ÷ income' matters unless you give it that ratio. Even powerful tree models benefit from good features because they need fewer splits to express the pattern.\n\nAndrew Ng: 'Applied machine learning is basically feature engineering.'",
      points: [
        "Ratios and differences: debt-to-income, price per sq ft, days between signup and first order",
        "Date-time parts: day of week, month, hour, is_weekend, is_festival_season (Diwali sales!), days_since_last_purchase",
        "Aggregations per group: customer's average order value, number of transactions in last 7 days (compute only from the past!)",
        "Transformations: log1p for skewed money columns, square root, Box-Cox / Yeo-Johnson (PowerTransformer)",
        "Binning: age groups (KBinsDiscretizer or pd.cut) — helps linear models capture non-linear effects",
        "Interactions / polynomials: PolynomialFeatures(degree=2, interaction_only=True)",
        "Text: length, word counts, TF-IDF (Day 11); cyclical encoding of hour with sin/cos",
      ],
    },
    {
      heading: "Encoding Tricks and Leakage in Feature Engineering",
      content: "**Cyclical features** like hour (0-23) or month (1-12): hour 23 and hour 0 are close, but as numbers they are far apart. Encode as `sin(2π·hour/24)` and `cos(2π·hour/24)`.\n\n**Target encoding** replaces a category with the mean target for that category — powerful for high-cardinality columns (pincode, merchant ID) but leaks the target unless done with cross-fitting. sklearn's `TargetEncoder` does this internally during fit_transform.\n\n**Time-based leakage**: features such as 'total purchases' must be computed only from data available **before** the prediction moment. Using the whole history including future transactions makes the model look brilliant offline and useless in production.",
      tip: "Ask for every feature: 'Would I know this value at the exact moment I make the prediction?' If not, drop it.",
    },
    {
      heading: "Feature Selection: Why and How",
      content: "Removing irrelevant or redundant features can reduce overfitting, speed up training, cut data collection costs and improve interpretability. Three families:\n\n**Filter methods** score each feature independently of a model: variance threshold, correlation, chi-square (non-negative features), ANOVA F-test (`f_classif`), mutual information (captures non-linear dependence). Fast but ignore interactions.\n\n**Wrapper methods** search over subsets using a model: Recursive Feature Elimination (RFE / RFECV) repeatedly fits a model and removes the weakest features; SequentialFeatureSelector adds/removes features greedily by CV score. Accurate but expensive.\n\n**Embedded methods** select during training: Lasso (L1) zeros out coefficients, tree-based importances with `SelectFromModel`.",
      syntax: `from sklearn.feature_selection import (VarianceThreshold, SelectKBest, f_classif,
    mutual_info_classif, RFE, RFECV, SelectFromModel, SequentialFeatureSelector)
SelectKBest(score_func=f_classif, k=10)
RFECV(LogisticRegression(max_iter=1000), step=1, cv=5)
SelectFromModel(Lasso(alpha=0.01))`,
      tip: "Feature selection that looks at y must happen inside the Pipeline, otherwise it leaks during cross-validation.",
    },
    {
      heading: "The Imbalanced Data Problem",
      content: "In fraud (0.1-1% fraud), churn (5-10%), rare disease or defect detection, one class is rare. Problems: (1) **accuracy is misleading** — always predicting 'no fraud' gives 99%+; (2) models are biased towards the majority because the loss is dominated by it; (3) the default 0.5 threshold is usually too high for the minority class.\n\n**Use the right metrics**: precision, recall, F1 for the minority class, PR-AUC (average precision), balanced accuracy, Matthews correlation coefficient. Use **stratified** splits and CV.",
    },
    {
      heading: "Techniques for Imbalanced Data",
      content: "**1. Class weights**: `class_weight='balanced'` makes each minority mistake cost more, weighting classes by n_samples / (n_classes · count_of_class). No data is duplicated or discarded; supported by LogisticRegression, SVC, trees, random forests (and `scale_pos_weight` in XGBoost).\n\n**2. Random undersampling**: drop majority rows — fast, but throws away information.\n\n**3. Random oversampling**: duplicate minority rows — risk of overfitting to those duplicates.\n\n**4. SMOTE** (Synthetic Minority Over-sampling Technique): for a minority point, pick one of its k nearest minority neighbours and create a **synthetic** point at a random position on the line between them: `x_new = x + λ·(x_neighbour − x)`, λ ∈ [0, 1]. Variants: Borderline-SMOTE, ADASYN, SMOTENC (categorical).\n\n**5. Threshold tuning**: keep the model, lower the decision threshold to trade precision for recall.\n\n**6. Anomaly detection** (IsolationForest) when positives are extremely rare.",
      points: [
        "SMOTE lives in the imbalanced-learn library: pip install imbalanced-learn; from imblearn.over_sampling import SMOTE",
        "Resample ONLY the training data (or training folds) — never the validation or test set",
        "Use imblearn.pipeline.Pipeline so SMOTE runs inside each CV fold",
        "Resampling and class weights distort predicted probabilities; recalibrate if you need true probabilities",
      ],
      tip: "In interviews, mention class weights + threshold tuning + PR-AUC first; they are simple, leak-free and often as good as SMOTE.",
    },
  ],
  examples: [
    {
      title: "Engineering Features from Dates and Amounts",
      scenario: "An e-commerce order table: create day-of-week, weekend flag, cyclical hour, log amount and per-customer history features.",
      steps: [
        "Create a small orders DataFrame",
        "Extract date parts and cyclical hour features",
        "Log-transform a skewed amount",
        "Compute per-customer 'previous orders' using only past rows",
      ],
      code: `import numpy as np
import pandas as pd

orders = pd.DataFrame({
    "customer": ["A", "B", "A", "A", "B", "C"],
    "ts": pd.to_datetime(["2024-10-28 23:10", "2024-10-29 09:30", "2024-11-01 13:00",
                          "2024-11-02 22:45", "2024-11-03 00:20", "2024-11-03 18:05"]),
    "amount": [499, 15999, 1299, 250, 89999, 649],
}).sort_values("ts")

orders["dow"] = orders["ts"].dt.day_name().str[:3]
orders["is_weekend"] = (orders["ts"].dt.dayofweek >= 5).astype(int)
hour = orders["ts"].dt.hour
orders["hour_sin"] = np.sin(2 * np.pi * hour / 24).round(3)
orders["hour_cos"] = np.cos(2 * np.pi * hour / 24).round(3)
orders["log_amount"] = np.log1p(orders["amount"]).round(2)
# history features computed from PAST orders only (no leakage)
orders["prev_orders"] = orders.groupby("customer").cumcount()
orders["prev_avg_amount"] = (orders.groupby("customer")["amount"]
                             .transform(lambda s: s.shift().expanding().mean())).round(0)
print(orders.drop(columns="ts").to_string(index=False))
`,
      python: { files: { "main.py": `import numpy as np
import pandas as pd

orders = pd.DataFrame({
    "customer": ["A", "B", "A", "A", "B", "C"],
    "ts": pd.to_datetime(["2024-10-28 23:10", "2024-10-29 09:30", "2024-11-01 13:00",
                          "2024-11-02 22:45", "2024-11-03 00:20", "2024-11-03 18:05"]),
    "amount": [499, 15999, 1299, 250, 89999, 649],
}).sort_values("ts")

orders["dow"] = orders["ts"].dt.day_name().str[:3]
orders["is_weekend"] = (orders["ts"].dt.dayofweek >= 5).astype(int)
hour = orders["ts"].dt.hour
orders["hour_sin"] = np.sin(2 * np.pi * hour / 24).round(3)
orders["hour_cos"] = np.cos(2 * np.pi * hour / 24).round(3)
orders["log_amount"] = np.log1p(orders["amount"]).round(2)
# history features computed from PAST orders only (no leakage)
orders["prev_orders"] = orders.groupby("customer").cumcount()
orders["prev_avg_amount"] = (orders.groupby("customer")["amount"]
                             .transform(lambda s: s.shift().expanding().mean())).round(0)
print(orders.drop(columns="ts").to_string(index=False))
` } },
      result: "customer  amount dow  is_weekend  hour_sin  hour_cos  log_amount  prev_orders  prev_avg_amount\n       A     499 Mon           0    -0.259     0.966        6.21            0              NaN\n       B   15999 Tue           0     0.707    -0.707        9.68            0              NaN\n       A    1299 Fri           0    -0.259    -0.966        7.17            1            499.0\n       A     250 Sat           1    -0.500     0.866        5.53            2            899.0\n       B   89999 Sun           1     0.000     1.000       11.41            1          15999.0\n       C     649 Sun           1    -1.000    -0.000        6.48            0              NaN",
      explanation: "Day of week and weekend capture shopping patterns; sin/cos make 23:10 and 00:20 close to each other; log1p compresses the huge range of amounts (₹250 to ₹89,999). cumcount and shift().expanding().mean() only use earlier orders of the same customer, so the features are available at prediction time — the first order of each customer has no history (0 and NaN).",
    },
    {
      title: "Filter Selection: SelectKBest with ANOVA and Mutual Information",
      scenario: "Out of 30 breast cancer features, find the 5 most informative using two filter scores.",
      steps: [
        "Score features with f_classif and mutual_info_classif",
        "Print the top 5 by each",
        "Compare CV accuracy of a model using all features vs top-5 inside a pipeline",
      ],
      code: `import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.feature_selection import SelectKBest, f_classif, mutual_info_classif
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

data = load_breast_cancer(as_frame=True)
X, y = data.data, data.target

f_scores = pd.Series(f_classif(X, y)[0], index=X.columns)
mi = pd.Series(mutual_info_classif(X, y, random_state=42), index=X.columns)
print("Top 5 by ANOVA F:", f_scores.nlargest(5).index.tolist())
print("Top 5 by MI     :", mi.nlargest(5).index.tolist())

for k in [30, 5]:
    pipe = make_pipeline(StandardScaler(), SelectKBest(f_classif, k=k),
                         LogisticRegression(max_iter=1000))
    print(f"k={k:2d} CV accuracy={cross_val_score(pipe, X, y, cv=5).mean():.3f}")
`,
      python: { files: { "main.py": `import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.feature_selection import SelectKBest, f_classif, mutual_info_classif
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

data = load_breast_cancer(as_frame=True)
X, y = data.data, data.target

f_scores = pd.Series(f_classif(X, y)[0], index=X.columns)
mi = pd.Series(mutual_info_classif(X, y, random_state=42), index=X.columns)
print("Top 5 by ANOVA F:", f_scores.nlargest(5).index.tolist())
print("Top 5 by MI     :", mi.nlargest(5).index.tolist())

for k in [30, 5]:
    pipe = make_pipeline(StandardScaler(), SelectKBest(f_classif, k=k),
                         LogisticRegression(max_iter=1000))
    print(f"k={k:2d} CV accuracy={cross_val_score(pipe, X, y, cv=5).mean():.3f}")
` } },
      result: "Top 5 by ANOVA F: ['worst concave points', 'worst perimeter', 'mean concave points', 'worst radius', 'mean perimeter']\nTop 5 by MI     : ['worst perimeter', 'worst area', 'worst radius', 'mean concave points', 'worst concave points']\nk=30 CV accuracy=0.981\nk= 5 CV accuracy=0.949",
      explanation: "Both filters agree that size and concavity features ('worst perimeter', 'worst concave points', …) are most informative. Keeping only 5 of 30 features costs about 3 points of accuracy (0.981 → 0.949) for a far simpler model — whether that trade is worth it is a business decision. Because SelectKBest is inside the pipeline, the scores are recomputed on each training fold, avoiding leakage.",
    },
    {
      title: "Wrapper and Embedded Selection: RFECV and SelectFromModel",
      scenario: "Let a model decide how many features to keep with cross-validated recursive feature elimination, and compare with Lasso-style L1 selection.",
      steps: [
        "Generate 25 features where only 5 are informative",
        "Run RFECV with logistic regression",
        "Run SelectFromModel with an L1-penalised logistic regression",
      ],
      code: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.feature_selection import RFECV, SelectFromModel
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold

X, y = make_classification(n_samples=600, n_features=25, n_informative=5,
                           n_redundant=0, shuffle=False, random_state=42)
# with shuffle=False the informative features are columns 0-4

rfecv = RFECV(LogisticRegression(max_iter=1000), step=1,
              cv=StratifiedKFold(5, shuffle=True, random_state=42), scoring="accuracy")
rfecv.fit(X, y)
print("RFECV optimal number of features:", rfecv.n_features_)
print("RFECV selected columns:", np.where(rfecv.support_)[0])

l1 = LogisticRegression(penalty="l1", solver="liblinear", C=0.05, random_state=42)
sfm = SelectFromModel(l1).fit(X, y)
print("L1 selected columns:", np.where(sfm.get_support())[0])
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.datasets import make_classification
from sklearn.feature_selection import RFECV, SelectFromModel
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold

X, y = make_classification(n_samples=600, n_features=25, n_informative=5,
                           n_redundant=0, shuffle=False, random_state=42)
# with shuffle=False the informative features are columns 0-4

rfecv = RFECV(LogisticRegression(max_iter=1000), step=1,
              cv=StratifiedKFold(5, shuffle=True, random_state=42), scoring="accuracy")
rfecv.fit(X, y)
print("RFECV optimal number of features:", rfecv.n_features_)
print("RFECV selected columns:", np.where(rfecv.support_)[0])

l1 = LogisticRegression(penalty="l1", solver="liblinear", C=0.05, random_state=42)
sfm = SelectFromModel(l1).fit(X, y)
print("L1 selected columns:", np.where(sfm.get_support())[0])
` } },
      result: "RFECV optimal number of features: 5\nRFECV selected columns: [0 1 2 3 4]\nL1 selected columns: [0 1 2 3 4]",
      explanation: "RFECV repeatedly drops the weakest feature and uses cross-validation to choose how many to keep; it recovers the informative columns 0-4 (sometimes plus a noise column or two). The L1 penalty zeroes out the coefficients of irrelevant features; a smaller C means stronger selection.",
    },
    {
      title: "Imbalanced Data: Accuracy Trap and class_weight",
      scenario: "A fraud-like dataset with 3% positives. Compare a default logistic regression with class_weight='balanced' using recall, precision and PR-AUC.",
      steps: [
        "Generate data with weights=[0.97, 0.03]",
        "Train with and without class_weight='balanced'",
        "Compare accuracy, minority precision/recall, balanced accuracy and PR-AUC",
      ],
      code: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             balanced_accuracy_score, average_precision_score)

X, y = make_classification(n_samples=10000, n_features=12, n_informative=5,
                           weights=[0.97, 0.03], flip_y=0.01, class_sep=0.8,
                           random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
print("Fraud rate in test:", round(y_te.mean(), 3))

for cw in [None, "balanced"]:
    m = LogisticRegression(class_weight=cw, max_iter=1000).fit(X_tr, y_tr)
    pred = m.predict(X_te)
    print(f"class_weight={str(cw):8s} acc={accuracy_score(y_te, pred):.3f} "
          f"precision={precision_score(y_te, pred):.3f} recall={recall_score(y_te, pred):.3f} "
          f"bal_acc={balanced_accuracy_score(y_te, pred):.3f} "
          f"PR-AUC={average_precision_score(y_te, m.predict_proba(X_te)[:, 1]):.3f}")
`,
      python: { files: { "main.py": `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             balanced_accuracy_score, average_precision_score)

X, y = make_classification(n_samples=10000, n_features=12, n_informative=5,
                           weights=[0.97, 0.03], flip_y=0.01, class_sep=0.8,
                           random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
print("Fraud rate in test:", round(y_te.mean(), 3))

for cw in [None, "balanced"]:
    m = LogisticRegression(class_weight=cw, max_iter=1000).fit(X_tr, y_tr)
    pred = m.predict(X_te)
    print(f"class_weight={str(cw):8s} acc={accuracy_score(y_te, pred):.3f} "
          f"precision={precision_score(y_te, pred):.3f} recall={recall_score(y_te, pred):.3f} "
          f"bal_acc={balanced_accuracy_score(y_te, pred):.3f} "
          f"PR-AUC={average_precision_score(y_te, m.predict_proba(X_te)[:, 1]):.3f}")
` } },
      result: "Fraud rate in test: 0.035\nclass_weight=None     acc=0.965 precision=0.667 recall=0.019 bal_acc=0.509 PR-AUC=0.153\nclass_weight=balanced acc=0.684 precision=0.074 recall=0.695 bal_acc=0.689 PR-AUC=0.111",
      explanation: "The default model shows 96.5% accuracy — yet it catches under 2% of the frauds (recall 0.019): the accuracy trap. With class_weight='balanced', recall jumps to about 70% at the cost of precision (many more false alarms) and balanced accuracy rises from ~0.51 to ~0.69. PR-AUC does not improve (it even dips) because class weights mainly shift the effective threshold rather than improving how well the model ranks frauds — this deliberately hard dataset needs better features, not just re-weighting.",
    },
    {
      title: "SMOTE by Hand (and with imbalanced-learn)",
      scenario: "Understand how SMOTE creates synthetic minority samples by interpolating between neighbours, using only NumPy and sklearn's NearestNeighbors.",
      steps: [
        "Take a handful of minority points",
        "For each new sample: choose a random minority point and one of its k nearest minority neighbours",
        "Create a point at a random fraction λ along the line between them",
        "See the imbalanced-learn equivalent in the comments",
      ],
      code: `import numpy as np
from sklearn.neighbors import NearestNeighbors

rng = np.random.default_rng(42)
minority = np.array([[1.0, 1.0], [1.5, 1.8], [2.0, 1.2], [1.2, 2.2], [2.4, 2.0]])

def smote(X_min, n_new, k=2):
    nn = NearestNeighbors(n_neighbors=k + 1).fit(X_min)   # +1 because a point is its own neighbour
    _, idx = nn.kneighbors(X_min)
    out = []
    for _ in range(n_new):
        i = rng.integers(len(X_min))
        j = rng.choice(idx[i, 1:])                       # random neighbour (not itself)
        lam = rng.random()
        out.append(X_min[i] + lam * (X_min[j] - X_min[i]))
    return np.array(out)

synthetic = smote(minority, n_new=5)
print("Synthetic samples:\\n", synthetic.round(3))
print("All inside the minority bounding box:",
      bool(((synthetic >= minority.min(0)) & (synthetic <= minority.max(0))).all()))

# Real projects (pip install imbalanced-learn):
# from imblearn.over_sampling import SMOTE
# from imblearn.pipeline import Pipeline
# pipe = Pipeline([("smote", SMOTE(random_state=42)), ("clf", LogisticRegression())])
# cross_val_score(pipe, X, y, cv=5, scoring="average_precision")  # SMOTE only on train folds
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.neighbors import NearestNeighbors

rng = np.random.default_rng(42)
minority = np.array([[1.0, 1.0], [1.5, 1.8], [2.0, 1.2], [1.2, 2.2], [2.4, 2.0]])

def smote(X_min, n_new, k=2):
    nn = NearestNeighbors(n_neighbors=k + 1).fit(X_min)   # +1 because a point is its own neighbour
    _, idx = nn.kneighbors(X_min)
    out = []
    for _ in range(n_new):
        i = rng.integers(len(X_min))
        j = rng.choice(idx[i, 1:])                       # random neighbour (not itself)
        lam = rng.random()
        out.append(X_min[i] + lam * (X_min[j] - X_min[i]))
    return np.array(out)

synthetic = smote(minority, n_new=5)
print("Synthetic samples:\\n", synthetic.round(3))
print("All inside the minority bounding box:",
      bool(((synthetic >= minority.min(0)) & (synthetic <= minority.max(0))).all()))

# Real projects (pip install imbalanced-learn):
# from imblearn.over_sampling import SMOTE
# from imblearn.pipeline import Pipeline
# pipe = Pipeline([("smote", SMOTE(random_state=42)), ("clf", LogisticRegression())])
# cross_val_score(pipe, X, y, cv=5, scoring="average_precision")  # SMOTE only on train folds
` } },
      result: "Synthetic samples:\n [[1.439 1.088]\n [2.279 1.758]\n [1.207 2.19 ]\n [1.043 1.257]\n [1.775 1.47 ]]\nAll inside the minority bounding box: True",
      explanation: "Each synthetic point lies on a line segment between two real minority neighbours, so SMOTE fills in the minority region instead of copying points exactly. Because it can create points in overlapping regions, it may add noise; always validate with PR-AUC on untouched, non-resampled data and resample only inside training folds via imblearn's Pipeline.",
    },
  ],
  interview: [
    { q: "What is feature engineering? Give examples from a real domain.", a: "Creating new input features from raw data using domain knowledge so that patterns are easier for the model to learn. Credit risk examples: debt-to-income ratio, number of loans in the last 6 months, utilisation = balance / credit limit, months since last default, EMI-to-salary ratio. E-commerce: days since last purchase, average order value, purchase frequency, weekend/festival flags.", level: "Easy" },
    { q: "How do you encode cyclical features like hour of day or month?", a: "Map them onto a circle with two features: sin(2π·x/period) and cos(2π·x/period). This way hour 23 and hour 0 are close in feature space, unlike raw integers. Tree models can also handle raw values reasonably, but linear and distance-based models benefit greatly from sin/cos encoding.", level: "Medium" },
    { q: "Explain filter, wrapper and embedded feature selection methods.", a: "Filter methods rank features using statistics independent of a model (correlation, chi-square, ANOVA F, mutual information) — fast but ignore interactions. Wrapper methods evaluate subsets by training a model (RFE, forward/backward selection) — accurate but expensive and can overfit. Embedded methods perform selection as part of training (Lasso L1, tree importances with SelectFromModel) — a good balance.", level: "Medium" },
    { q: "What is mutual information and how is it different from correlation?", a: "Mutual information measures how much knowing one variable reduces uncertainty about another, capturing any kind of dependency, including non-linear and non-monotonic ones. Pearson correlation captures only linear relationships; a feature with a U-shaped relation to the target can have zero correlation but high mutual information.", level: "Hard" },
    { q: "Why is accuracy misleading on imbalanced data? What metrics do you use instead?", a: "With 99% negatives, predicting all negatives gives 99% accuracy while missing every positive. Use confusion matrix, precision, recall, F1/Fβ for the minority class, PR-AUC (average precision), balanced accuracy, and Matthews correlation coefficient. Choose based on the business cost of false positives and false negatives.", level: "Easy" },
    { q: "How does class_weight='balanced' work?", a: "It assigns each class a weight inversely proportional to its frequency: n_samples / (n_classes × count_of_class). The loss for each sample is multiplied by its class weight, so misclassifying a rare-class sample costs more and the model is pushed to pay attention to it. No resampling is done, so there is no duplication or data loss.", level: "Medium" },
    { q: "How does SMOTE work, and what are its limitations?", a: "For each minority sample, SMOTE finds its k nearest minority neighbours, picks one at random and generates a synthetic point at a random position on the segment between them. Limitations: can create noisy samples in overlapping regions, ignores the majority class distribution, does not work directly with categorical features (use SMOTENC), can worsen probability calibration, and adds little for tree boosters compared with class weights. It must be applied only to training data.", level: "Medium" },
    { q: "Why must you apply SMOTE only after splitting and inside cross-validation?", a: "If you oversample before splitting, synthetic points generated from a sample (or near-copies) can land in both training and validation sets, so the model is validated on data derived from its training data — leakage that inflates scores. Use imblearn.pipeline.Pipeline so SMOTE is applied only to the training part of each fold, and evaluate on the original distribution.", level: "Hard" },
    { q: "Undersampling vs oversampling — pros and cons?", a: "Undersampling removes majority samples: faster training and less memory, but loses potentially useful information and increases variance. Oversampling (random or SMOTE) keeps all data and adds minority samples: no information loss, but risk of overfitting to duplicated/synthetic minority points and longer training. Combinations like SMOTE + Tomek links or SMOTEENN clean overlapping regions.", level: "Medium" },
    { q: "Your fraud model has 0.99 ROC-AUC but the operations team says it flags too many genuine transactions. What would you do?", a: "Check precision at the current threshold and PR-AUC — ROC-AUC is inflated by the huge number of negatives. Raise the decision threshold to meet a precision or alert-volume target; optimise for expected cost (fraud loss vs investigation cost); add better features; consider a two-stage system (high-recall model then a high-precision reviewer model); monitor precision over time.", level: "Hard" },
    { q: "How do you prevent leakage while creating aggregate features like 'customer's average spend'?", a: "Compute aggregates only from data before the prediction timestamp — e.g. shift then expanding mean per customer, or point-in-time joins in a feature store. For train/test evaluation split by time first, then compute features for the test period using only history available at that time. Never use target-derived statistics computed on the full dataset.", level: "Hard" },
    { q: "Should you remove highly correlated features?", a: "For linear models and interpretation, highly correlated features cause unstable coefficients, so dropping one or using regularisation/PCA helps. For tree ensembles, correlated features rarely hurt accuracy but split importance between them, confusing interpretation. For predictive performance alone, test with cross-validation rather than dropping blindly.", level: "Medium" },
  ],
  practice: [
    {
      task: "Given a DataFrame with columns 'signup_date' and 'last_login' (datetimes) and 'total_spent', 'num_orders', create: days_active, avg_order_value (handle num_orders = 0), signup_month, and is_weekend_signup.",
      hint: "Subtract dates and use .dt.days; use np.where or division with replace(0, np.nan).",
      solution: `import numpy as np
import pandas as pd
df = pd.DataFrame({
    "signup_date": pd.to_datetime(["2024-01-06", "2024-03-15", "2024-07-20"]),
    "last_login": pd.to_datetime(["2024-11-01", "2024-03-20", "2024-10-10"]),
    "total_spent": [12000, 0, 4500],
    "num_orders": [8, 0, 3],
})
df["days_active"] = (df["last_login"] - df["signup_date"]).dt.days
df["avg_order_value"] = (df["total_spent"] / df["num_orders"].replace(0, np.nan)).fillna(0)
df["signup_month"] = df["signup_date"].dt.month
df["is_weekend_signup"] = (df["signup_date"].dt.dayofweek >= 5).astype(int)
print(df)`,
    },
    {
      task: "Use SequentialFeatureSelector (forward, n_features_to_select=4, cv=5) with a KNN classifier in a scaled pipeline on load_wine. Print the selected feature names.",
      hint: "Fit the selector on scaled data or put StandardScaler before it in a pipeline; get_support() gives a boolean mask.",
      solution: `from sklearn.datasets import load_wine
from sklearn.feature_selection import SequentialFeatureSelector
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

d = load_wine(as_frame=True)
Xs = StandardScaler().fit_transform(d.data)
sfs = SequentialFeatureSelector(KNeighborsClassifier(5), n_features_to_select=4,
                                direction="forward", cv=5).fit(Xs, d.target)
print(d.data.columns[sfs.get_support()].tolist())
# Typically includes features like proline, flavanoids, color_intensity and alcohol.
# (For a fully honest estimate, put scaler + selector + model in one Pipeline and cross-validate it.)`,
    },
    {
      task: "On the imbalanced dataset from Example 4, instead of class weights, keep the default model and lower the threshold. Find the threshold that maximises F1 on a validation split carved out of the training data, then report test precision and recall.",
      hint: "precision_recall_curve(y_val, proba) returns precision, recall and thresholds; compute F1 for each.",
      solution: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_recall_curve, precision_score, recall_score

X, y = make_classification(n_samples=10000, n_features=12, n_informative=5,
                           weights=[0.97, 0.03], flip_y=0.01, class_sep=0.8, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
X_fit, X_val, y_fit, y_val = train_test_split(X_tr, y_tr, test_size=0.25, random_state=0, stratify=y_tr)

m = LogisticRegression(max_iter=1000).fit(X_fit, y_fit)
p, r, t = precision_recall_curve(y_val, m.predict_proba(X_val)[:, 1])
f1 = 2 * p * r / (p + r + 1e-12)
best_t = t[np.argmax(f1[:-1])]
pred = (m.predict_proba(X_te)[:, 1] >= best_t).astype(int)
print("threshold:", round(best_t, 3))
print("test precision:", round(precision_score(y_te, pred), 3),
      "recall:", round(recall_score(y_te, pred), 3))
# The best-F1 threshold is ~0.13, far below 0.5. Test precision ~0.17 and recall ~0.17 give
# a higher F1 than either the default model (recall ~0.02) or class_weight='balanced'.`,
    },
    {
      task: "For a dataset with 950 negatives and 50 positives, compute the weights that class_weight='balanced' assigns to each class.",
      hint: "weight_c = n_samples / (n_classes × count_c).",
      solution: "n_samples = 1000, n_classes = 2.\nweight(neg) = 1000 / (2 × 950) ≈ 0.526\nweight(pos) = 1000 / (2 × 50) = 10.0\nSo each positive counts about 19× more than a negative in the loss. You can verify with sklearn.utils.class_weight.compute_class_weight('balanced', classes=[0, 1], y=y).",
    },
  ],
  quiz: [
    { question: "Which encoding makes hour 23 and hour 0 close to each other?", options: ["One-hot", "Ordinal", "sin/cos cyclical encoding", "Log transform"], answer: 2, explanation: "Mapping hours onto a circle with sin and cos preserves their cyclical closeness." },
    { question: "RFE is an example of which feature selection family?", options: ["Filter", "Wrapper", "Embedded", "Unsupervised"], answer: 1, explanation: "Recursive Feature Elimination repeatedly trains a model to decide which features to drop." },
    { question: "Lasso-based selection is an example of:", options: ["Filter", "Wrapper", "Embedded", "Resampling"], answer: 2, explanation: "Selection happens during training via the L1 penalty." },
    { question: "SMOTE creates new minority samples by:", options: ["Duplicating minority rows", "Interpolating between a minority point and its minority neighbours", "Deleting majority rows", "Adding Gaussian noise to all rows"], answer: 1, explanation: "Synthetic points lie on line segments between neighbouring minority samples." },
    { question: "When should SMOTE be applied?", options: ["Before train-test split", "On the test set", "Only on the training data / training folds", "On the whole dataset before CV"], answer: 2, explanation: "Resampling before splitting leaks information into validation/test data." },
    { question: "With 1% positives, which metric is most informative?", options: ["Accuracy", "PR-AUC (average precision)", "R²", "Inertia"], answer: 1, explanation: "PR-AUC focuses on the minority class and is not inflated by the many negatives." },
  ],
};
