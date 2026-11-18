export default {
  id: "day-02-data-preprocessing-pipelines-columntransformer",
  title: "Data Preprocessing: Train-Test Split, Scaling, Encoding, Imputation, Pipelines and ColumnTransformer",
  module: "Module 1: ML Foundations",
  day: 2,
  level: "Beginner",
  duration: "3 hours",
  summary: "Real data is messy: missing values, text categories and features on wildly different scales. Learn how to clean and transform data correctly with scikit-learn, and how Pipelines and ColumnTransformer prevent data leakage and make your code production-ready.",
  objectives: [
    "Split data correctly into train and test sets (with stratification and reproducibility)",
    "Impute missing values with SimpleImputer and understand the strategies",
    "Encode categorical features with OneHotEncoder and OrdinalEncoder",
    "Scale numeric features with StandardScaler and MinMaxScaler and know when scaling matters",
    "Combine everything into a Pipeline with ColumnTransformer and explain data leakage",
  ],
  theory: [
    {
      heading: "Why Preprocessing Matters",
      content: "ML algorithms work only with numbers, and most of them assume the data is complete and reasonably scaled. Raw business data has blanks (a customer did not fill 'income'), text categories ('Mumbai', 'Pune'), and columns on very different scales (age 18-60 vs salary 2,00,000-50,00,000).\n\n'Garbage in, garbage out': in real projects 60-80% of the time goes into data preparation. Good preprocessing often improves a model more than switching to a fancier algorithm.",
      points: [
        "Missing values → imputation (fill) or dropping",
        "Categorical text → encoding into numbers",
        "Different scales → scaling / normalisation",
        "Skewed numbers (income, prices) → log transform can help",
        "Outliers → cap (clip), transform or investigate",
      ],
    },
    {
      heading: "Train-Test Split and Data Leakage",
      content: "`train_test_split` randomly shuffles and splits rows. Use `test_size` (0.2 = 20%), `random_state` for reproducibility, and `stratify=y` for classification so class ratios stay the same.\n\n**Data leakage** happens when information from the test set (or from the future) sneaks into training. Classic mistake: scaling or imputing the WHOLE dataset before splitting. The scaler's mean then includes test rows, so the test score becomes optimistically biased. Rule: **split first, then fit every preprocessing step on the training data only**.",
      syntax: `from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)
`,
      tip: "For time-series data (sales by date), never shuffle — train on the past and test on the future. Use TimeSeriesSplit.",
    },
    {
      heading: "Handling Missing Values (Imputation)",
      content: "`SimpleImputer` replaces missing values (NaN) with a statistic learned from training data. For numeric columns use `strategy='median'` (robust to outliers) or `'mean'`. For categorical columns use `'most_frequent'` or `'constant'` with `fill_value='missing'`.\n\nOther options: drop rows (only if very few are missing), drop columns (if mostly empty), `KNNImputer` (fill using similar rows), or add a missing-indicator flag (`add_indicator=True`) because 'missingness' itself can be informative — e.g. a blank income field may signal a risky applicant.",
      points: [
        "df.isna().sum() — count missing values per column",
        "Mean is pulled by outliers; median is safer for salary-like data",
        "Tree-based HistGradientBoosting handles NaN natively, but most sklearn models raise an error on NaN",
      ],
    },
    {
      heading: "Encoding Categorical Variables",
      content: "**Nominal** categories have no order (city, colour). Use **One-Hot Encoding**: one new 0/1 column per category. 'Pune' becomes [0, 1, 0] for columns city_Delhi, city_Pune, city_Mumbai. Set `handle_unknown='ignore'` so an unseen city at prediction time becomes all zeros instead of crashing.\n\n**Ordinal** categories have a natural order (education: 10th < 12th < Graduate < PG; size S < M < L). Use `OrdinalEncoder(categories=[[...]])` with the order spelled out.\n\nWhy not just label 'Delhi'=0, 'Pune'=1, 'Mumbai'=2 for nominal data? A linear model would then think Mumbai is 'twice' Pune, an order that does not exist. `LabelEncoder` is meant for the **target y**, not features.",
      tip: "High-cardinality columns (10,000 pincodes) explode one-hot into 10,000 columns. Use grouping of rare categories (min_frequency), target encoding (TargetEncoder in sklearn ≥ 1.3) or frequency encoding instead.",
    },
    {
      heading: "Feature Scaling",
      content: "**Standardisation** (`StandardScaler`): z = (x − mean) / std → each feature gets mean 0 and std 1. Default choice.\n\n**Normalisation / Min-Max** (`MinMaxScaler`): x' = (x − min) / (max − min) → values between 0 and 1. Useful for neural networks and image pixels, but sensitive to outliers.\n\n**RobustScaler** uses the median and IQR, so outliers have less effect.\n\nScaling matters for algorithms based on **distance** (KNN, K-Means, SVM), **gradient descent** (logistic regression, neural nets) and **regularisation** (Ridge, Lasso), and for PCA. Tree-based models (decision tree, random forest, gradient boosting) split on thresholds and do **not** need scaling.",
      points: [
        "KNN with unscaled salary and age: salary dominates the distance completely",
        "Never scale the target for classification; for regression it is optional (TransformedTargetRegressor)",
      ],
    },
    {
      heading: "Pipelines and ColumnTransformer",
      content: "A `Pipeline` chains steps: transformers followed by a final estimator. Calling `pipe.fit(X_train, y_train)` fits each step on training data in order; `pipe.predict(X_test)` only transforms then predicts. This makes leakage almost impossible and lets you cross-validate and save the whole thing as one object.\n\n`ColumnTransformer` applies different preprocessing to different columns — e.g. impute + scale the numeric columns, impute + one-hot the categorical columns — and concatenates the results.",
      syntax: `from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

num_pipe = Pipeline([("impute", SimpleImputer(strategy="median")),
                     ("scale", StandardScaler())])
cat_pipe = Pipeline([("impute", SimpleImputer(strategy="most_frequent")),
                     ("onehot", OneHotEncoder(handle_unknown="ignore"))])
pre = ColumnTransformer([("num", num_pipe, ["age", "salary"]),
                         ("cat", cat_pipe, ["city"])])
model = Pipeline([("pre", pre), ("clf", LogisticRegression())])
model.fit(X_train, y_train)
`,
      tip: "Step parameters are addressed with double underscores: model.set_params(clf__C=0.5) or in GridSearchCV param_grid={'clf__C': [0.1, 1, 10]}.",
    },
  ],
  examples: [
    {
      title: "Detecting and Imputing Missing Values",
      scenario: "An HR dataset of employees has some missing ages and cities. Fill them sensibly using statistics learned from data.",
      steps: [
        "Create a small DataFrame with NaN values",
        "Count missing values with isna().sum()",
        "Fit a median imputer for the numeric column and most_frequent for the text column",
        "Print the learned statistics_ and the filled data",
      ],
      code: `import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer

df = pd.DataFrame({
    "age": [25, np.nan, 35, 45, np.nan, 29],
    "city": ["Pune", "Delhi", np.nan, "Pune", "Mumbai", "Pune"],
})
print(df.isna().sum().to_dict())

num_imp = SimpleImputer(strategy="median")
cat_imp = SimpleImputer(strategy="most_frequent")
df["age"] = num_imp.fit_transform(df[["age"]]).ravel()
df["city"] = cat_imp.fit_transform(df[["city"]]).ravel()

print("Median learned:", num_imp.statistics_)
print("Mode learned:", cat_imp.statistics_)
print(df.to_string())
`,
      python: { files: { "main.py": `import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer

df = pd.DataFrame({
    "age": [25, np.nan, 35, 45, np.nan, 29],
    "city": ["Pune", "Delhi", np.nan, "Pune", "Mumbai", "Pune"],
})
print(df.isna().sum().to_dict())

num_imp = SimpleImputer(strategy="median")
cat_imp = SimpleImputer(strategy="most_frequent")
df["age"] = num_imp.fit_transform(df[["age"]]).ravel()
df["city"] = cat_imp.fit_transform(df[["city"]]).ravel()

print("Median learned:", num_imp.statistics_)
print("Mode learned:", cat_imp.statistics_)
print(df.to_string())
` } },
      result: "{'age': 2, 'city': 1}\nMedian learned: [32.]\nMode learned: ['Pune']\n    age    city\n0  25.0    Pune\n1  32.0   Delhi\n2  35.0    Pune\n3  45.0    Pune\n4  32.0  Mumbai\n5  29.0    Pune",
      explanation: "The median of the known ages (25, 35, 45, 29) is 32, so both missing ages become 32. The most frequent city is Pune. In a real project you would fit these imputers on training data only, ideally inside a Pipeline.",
    },
    {
      title: "One-Hot vs Ordinal Encoding",
      scenario: "Encode a nominal column (city) with one-hot encoding and an ordinal column (education) with a meaningful order.",
      steps: [
        "Create a DataFrame with city and education",
        "OneHotEncoder with handle_unknown='ignore' and sparse_output=False",
        "OrdinalEncoder with the category order given explicitly",
        "Transform an unseen city to see how it is handled",
      ],
      code: `import pandas as pd
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder

df = pd.DataFrame({
    "city": ["Pune", "Delhi", "Mumbai", "Pune"],
    "education": ["12th", "Graduate", "PG", "Graduate"],
})

ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
city_enc = ohe.fit_transform(df[["city"]])
print(ohe.get_feature_names_out().tolist())
print(city_enc)

order = [["10th", "12th", "Graduate", "PG"]]
oe = OrdinalEncoder(categories=order)
print(oe.fit_transform(df[["education"]]).ravel())

# Unseen category at prediction time
print("Chennai ->", ohe.transform(pd.DataFrame({"city": ["Chennai"]})))
`,
      python: { files: { "main.py": `import pandas as pd
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder

df = pd.DataFrame({
    "city": ["Pune", "Delhi", "Mumbai", "Pune"],
    "education": ["12th", "Graduate", "PG", "Graduate"],
})

ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
city_enc = ohe.fit_transform(df[["city"]])
print(ohe.get_feature_names_out().tolist())
print(city_enc)

order = [["10th", "12th", "Graduate", "PG"]]
oe = OrdinalEncoder(categories=order)
print(oe.fit_transform(df[["education"]]).ravel())

# Unseen category at prediction time
print("Chennai ->", ohe.transform(pd.DataFrame({"city": ["Chennai"]})))
` } },
      result: "['city_Delhi', 'city_Mumbai', 'city_Pune']\n[[0. 0. 1.]\n [1. 0. 0.]\n [0. 1. 0.]\n [0. 0. 1.]]\n[1. 2. 3. 2.]\nChennai -> [[0. 0. 0.]]",
      explanation: "One-hot creates one column per city (sorted alphabetically). Ordinal encoding follows the order we passed, so 12th=1, Graduate=2, PG=3. Because handle_unknown='ignore', the unseen city Chennai becomes all zeros instead of raising an error — essential for production systems.",
    },
    {
      title: "Why Scaling Matters for KNN",
      scenario: "Compare KNN accuracy on the wine dataset with and without scaling. Wine features range from ~0.1 to ~1600.",
      steps: [
        "Split the wine dataset with stratification",
        "Train KNN on raw features",
        "Train KNN inside a Pipeline with StandardScaler",
        "Compare test accuracy",
      ],
      code: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_wine(return_X_y=True)
print("Feature max values:", X.max(axis=0)[:5].round(1), "...", X.max(axis=0)[-1])

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

raw = KNeighborsClassifier(n_neighbors=5).fit(X_tr, y_tr)
scaled = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5)).fit(X_tr, y_tr)

print("KNN without scaling:", round(raw.score(X_te, y_te), 3))
print("KNN with scaling   :", round(scaled.score(X_te, y_te), 3))
`,
      python: { files: { "main.py": `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_wine(return_X_y=True)
print("Feature max values:", X.max(axis=0)[:5].round(1), "...", X.max(axis=0)[-1])

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

raw = KNeighborsClassifier(n_neighbors=5).fit(X_tr, y_tr)
scaled = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5)).fit(X_tr, y_tr)

print("KNN without scaling:", round(raw.score(X_te, y_te), 3))
print("KNN with scaling   :", round(scaled.score(X_te, y_te), 3))
` } },
      result: "Feature max values: [ 14.8   5.8   3.2  30.  162. ] ... 1680.0\nKNN without scaling: 0.722\nKNN with scaling   : 0.963",
      explanation: "The 'proline' feature goes up to 1680 while others are below 15, so without scaling the distance is almost entirely decided by proline. After standardisation every feature contributes fairly and accuracy jumps dramatically. make_pipeline is a shortcut that names steps automatically.",
    },
    {
      title: "Full Pipeline with ColumnTransformer",
      scenario: "Predict whether a loan applicant defaults using mixed numeric and categorical columns with missing values — the realistic interview-style setup.",
      steps: [
        "Build a small synthetic loan dataset with pandas",
        "Define numeric and categorical sub-pipelines",
        "Combine them in a ColumnTransformer, then add LogisticRegression",
        "Fit on train, evaluate on test, and predict for a new applicant",
      ],
      code: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression

rng = np.random.default_rng(42)
n = 400
df = pd.DataFrame({
    "income": rng.normal(60000, 20000, n).round(),
    "loan_amount": rng.normal(300000, 100000, n).round(),
    "city": rng.choice(["Pune", "Delhi", "Mumbai"], n),
    "employment": rng.choice(["salaried", "self-employed"], n),
})
risk = df["loan_amount"] / df["income"] + (df["employment"] == "self-employed") * 1.5
df["default"] = (risk + rng.normal(0, 1, n) > 6.5).astype(int)
df.loc[rng.choice(n, 30, replace=False), "income"] = np.nan   # missing values

X, y = df.drop(columns="default"), df["default"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

num_cols, cat_cols = ["income", "loan_amount"], ["city", "employment"]
pre = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")),
                      ("sc", StandardScaler())]), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
])
model = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=1000))])
model.fit(X_tr, y_tr)

print("Default rate:", round(y.mean(), 3))
print("Test accuracy:", round(model.score(X_te, y_te), 3))
print("Output features:", model.named_steps["pre"].get_feature_names_out().tolist())
new = pd.DataFrame([{"income": 30000, "loan_amount": 400000,
                     "city": "Chennai", "employment": "self-employed"}])
print("Default probability:", model.predict_proba(new)[0, 1].round(3))
`,
      python: { files: { "main.py": `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression

rng = np.random.default_rng(42)
n = 400
df = pd.DataFrame({
    "income": rng.normal(60000, 20000, n).round(),
    "loan_amount": rng.normal(300000, 100000, n).round(),
    "city": rng.choice(["Pune", "Delhi", "Mumbai"], n),
    "employment": rng.choice(["salaried", "self-employed"], n),
})
risk = df["loan_amount"] / df["income"] + (df["employment"] == "self-employed") * 1.5
df["default"] = (risk + rng.normal(0, 1, n) > 6.5).astype(int)
df.loc[rng.choice(n, 30, replace=False), "income"] = np.nan   # missing values

X, y = df.drop(columns="default"), df["default"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

num_cols, cat_cols = ["income", "loan_amount"], ["city", "employment"]
pre = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")),
                      ("sc", StandardScaler())]), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
])
model = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=1000))])
model.fit(X_tr, y_tr)

print("Default rate:", round(y.mean(), 3))
print("Test accuracy:", round(model.score(X_te, y_te), 3))
print("Output features:", model.named_steps["pre"].get_feature_names_out().tolist())
new = pd.DataFrame([{"income": 30000, "loan_amount": 400000,
                     "city": "Chennai", "employment": "self-employed"}])
print("Default probability:", model.predict_proba(new)[0, 1].round(3))
` } },
      result: "Default rate: 0.378\nTest accuracy: 0.9\nOutput features: ['num__income', 'num__loan_amount', 'cat__city_Delhi', 'cat__city_Mumbai', 'cat__city_Pune', 'cat__employment_salaried', 'cat__employment_self-employed']\nDefault probability: 0.997",
      explanation: "The ColumnTransformer sends numeric columns through median-imputation and scaling, and categorical columns through one-hot encoding. Everything is fitted only on training rows when model.fit runs. The new applicant comes from an unseen city (Chennai) — handle_unknown='ignore' handles it — and a high loan-to-income ratio gives a high default probability.",
    },
  ],
  interview: [
    { q: "What is data leakage? Give an example.", a: "Data leakage is when information that would not be available at prediction time, or information from the test set, is used while training. It produces over-optimistic evaluation results that collapse in production. Examples: scaling/imputing the full dataset before splitting; including a feature like 'loan_closed_date' to predict default; using future data in time series; duplicate rows across train and test. Prevent it by splitting first and putting all preprocessing inside a Pipeline.", level: "Medium" },
    { q: "Difference between StandardScaler and MinMaxScaler?", a: "StandardScaler transforms each feature to mean 0 and standard deviation 1 using z = (x − mean)/std; values are unbounded. MinMaxScaler maps each feature to a fixed range, usually [0, 1], using (x − min)/(max − min). MinMax is sensitive to outliers since one extreme value compresses all others. StandardScaler is the usual default; RobustScaler (median/IQR) is best with outliers.", level: "Easy" },
    { q: "Which algorithms need feature scaling and which do not?", a: "Need scaling: distance-based (KNN, K-Means, SVM with RBF kernel), gradient-descent based (logistic/linear regression with regularisation, neural networks), and PCA. Do not need scaling: tree-based models — decision trees, random forests, gradient boosting, XGBoost — because they split on thresholds of one feature at a time, which is unaffected by monotonic scaling.", level: "Medium" },
    { q: "When would you use one-hot encoding vs label/ordinal encoding?", a: "Use one-hot encoding for nominal categories without order (city, colour, brand) so the model does not assume a fake ordering. Use ordinal encoding when categories have a real order (low < medium < high, education level). Tree models can often handle ordinal-encoded nominal features reasonably well, but linear models should get one-hot. LabelEncoder in sklearn is intended for the target variable.", level: "Easy" },
    { q: "How do you handle missing values?", a: "First understand why they are missing (random, systematic). Options: drop rows (if few), drop columns (if mostly missing), impute with mean/median (numeric) or mode/constant (categorical), KNNImputer or IterativeImputer for model-based filling, add a missing indicator column, or use models that handle NaN natively (HistGradientBoosting, XGBoost, LightGBM). Always fit the imputer on training data only.", level: "Medium" },
    { q: "What is the dummy variable trap?", a: "When you one-hot encode a category with k levels into k columns, the columns always sum to 1, so they are perfectly collinear with the intercept in linear regression. This makes coefficients unidentifiable. Solution: drop one column (drop='first' in OneHotEncoder or drop_first=True in pd.get_dummies). With regularisation (Ridge/Lasso/default LogisticRegression) it is less of a problem.", level: "Hard" },
    { q: "Why use a Pipeline in scikit-learn?", a: "Pipelines chain preprocessing and the model into one estimator. Benefits: prevents leakage because preprocessing is fit only on training folds during cross-validation; cleaner code; one object to save with joblib and deploy; easy hyperparameter tuning of any step with step__param syntax; guarantees the same transformations at training and prediction time.", level: "Medium" },
    { q: "What does ColumnTransformer do?", a: "It applies different transformers to different subsets of columns and concatenates the outputs. Typical use: numeric columns → impute + scale, categorical columns → impute + one-hot. Columns not listed are dropped by default (remainder='drop'); use remainder='passthrough' to keep them.", level: "Easy" },
    { q: "Why should you use fit_transform on training data but only transform on test data?", a: "The test set represents unseen future data. The model and preprocessing must be based only on information from training data. Calling fit on the test set would compute new means/categories from test data, causing leakage and an inconsistent transformation compared with what the model was trained on.", level: "Easy" },
    { q: "How do you deal with a categorical column that has thousands of unique values?", a: "Options: group rare categories into 'Other' (OneHotEncoder min_frequency / max_categories), frequency or count encoding, target encoding with cross-fitting (sklearn TargetEncoder) to avoid leakage, hashing trick (FeatureHasher), learned embeddings in neural networks, or using CatBoost which handles categories natively.", level: "Hard" },
    { q: "Should you remove outliers before training?", a: "Not blindly. First check if they are errors (age = 250) or genuine rare events (a very large transaction — which may be exactly what a fraud model needs). Errors can be fixed or removed; genuine outliers can be capped (winsorising), log-transformed, handled with RobustScaler, or modelled with robust algorithms like tree ensembles. Removing outliers only from training data must be done carefully.", level: "Medium" },
  ],
  practice: [
    {
      task: "Given df = pd.DataFrame({'salary': [30000, 45000, None, 1000000, 52000]}), impute the missing value with the mean and with the median. Which is more sensible and why?",
      hint: "Use SimpleImputer twice with different strategies and look at statistics_.",
      solution: `import pandas as pd
from sklearn.impute import SimpleImputer
df = pd.DataFrame({"salary": [30000, 45000, None, 1000000, 52000]})
for s in ["mean", "median"]:
    imp = SimpleImputer(strategy=s).fit(df)
    print(s, imp.statistics_)
# mean   -> 281750.0 (pulled up by the 10 lakh outlier)
# median -> 48500.0 (robust, more sensible)`,
    },
    {
      task: "Use pd.get_dummies to one-hot encode df = pd.DataFrame({'size': ['S','M','L','M'], 'colour': ['red','blue','red','green']}) with drop_first=True. Then encode 'size' instead with OrdinalEncoder in the order S < M < L.",
      hint: "pd.get_dummies(df, columns=[...], drop_first=True, dtype=int).",
      solution: `import pandas as pd
from sklearn.preprocessing import OrdinalEncoder
df = pd.DataFrame({"size": ["S","M","L","M"], "colour": ["red","blue","red","green"]})
print(pd.get_dummies(df, columns=["colour"], drop_first=True, dtype=int))
oe = OrdinalEncoder(categories=[["S", "M", "L"]])
df["size_enc"] = oe.fit_transform(df[["size"]]).ravel()
print(df)   # S=0, M=1, L=2
# Note: pd.get_dummies is fine for quick EDA; prefer OneHotEncoder in pipelines because
# it remembers the categories seen in training.`,
    },
    {
      task: "Build a Pipeline for the breast cancer dataset: StandardScaler → LogisticRegression(max_iter=1000). Compare its test accuracy with an SVC() with and without scaling (split 75/25, random_state=42, stratify=y).",
      hint: "make_pipeline(StandardScaler(), SVC()). SVM is very sensitive to scale.",
      solution: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
models = {
    "LogReg scaled": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
    "SVC raw": SVC(),
    "SVC scaled": make_pipeline(StandardScaler(), SVC()),
}
for name, m in models.items():
    print(name, round(m.fit(X_tr, y_tr).score(X_te, y_te), 3))
# Scaled versions score about 0.98-0.99; raw SVC is noticeably lower (~0.92).`,
    },
    {
      task: "Demonstrate data leakage: on load_diabetes, compare (a) StandardScaler fitted on all data before splitting vs (b) a Pipeline. Then explain why the numbers may look similar here but the approach (a) is still wrong.",
      hint: "Leakage effects are small for scaling on big data, but large for target-based steps like feature selection.",
      solution: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import Ridge

X, y = load_diabetes(return_X_y=True)
# (a) WRONG: scaler sees test rows
Xs = StandardScaler().fit_transform(X)
a_tr, a_te, y_tr, y_te = train_test_split(Xs, y, random_state=42)
print("Leaky :", round(Ridge().fit(a_tr, y_tr).score(a_te, y_te), 3))
# (b) RIGHT
X_tr, X_te, y_tr, y_te = train_test_split(X, y, random_state=42)
pipe = make_pipeline(StandardScaler(), Ridge()).fit(X_tr, y_tr)
print("Pipeline:", round(pipe.score(X_te, y_te), 3))
# The numbers are close because a mean/std barely changes, but (a) breaks the rule that
# test data must be unseen. With target-aware steps (SelectKBest, target encoding,
# oversampling) leakage can inflate scores massively.`,
    },
  ],
  quiz: [
    { question: "What is the correct order to avoid data leakage?", options: ["Scale all data, then split", "Split, then fit the scaler on train and transform both", "Split, then fit the scaler on test", "Fit the scaler on train + test together"], answer: 1, explanation: "Always split first and fit preprocessing on training data only, then apply (transform) to test data." },
    { question: "Which encoder suits a 'city' column for logistic regression?", options: ["OrdinalEncoder", "LabelEncoder", "OneHotEncoder", "StandardScaler"], answer: 2, explanation: "City is nominal (no order), so one-hot encoding avoids imposing a fake order on a linear model." },
    { question: "Which model does NOT need feature scaling?", options: ["KNN", "SVM with RBF kernel", "Random Forest", "Logistic regression with L2 penalty"], answer: 2, explanation: "Tree-based models split on thresholds per feature and are invariant to monotonic scaling." },
    { question: "For a salary column with extreme outliers, the best simple imputation strategy is:", options: ["mean", "median", "max", "zero"], answer: 1, explanation: "The median is robust to outliers, unlike the mean." },
    { question: "In a pipeline step named 'clf', how do you refer to its C parameter in GridSearchCV?", options: ["clf.C", "clf-C", "clf__C", "C__clf"], answer: 2, explanation: "scikit-learn uses step_name__parameter (double underscore) syntax." },
    { question: "What does handle_unknown='ignore' do in OneHotEncoder?", options: ["Drops rows with unknown categories", "Encodes unseen categories as all zeros", "Raises an error", "Adds a new column automatically"], answer: 1, explanation: "Categories not seen during fit are encoded as a row of zeros, so prediction does not crash." },
  ],
};
