export default {
  id: "day-01-what-is-ml-types-workflow-sklearn-api",
  title: "What is Machine Learning? Types, ML Workflow and the scikit-learn API",
  module: "Module 1: ML Foundations",
  day: 1,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Understand what machine learning really is, the three main types of learning, the step-by-step workflow every ML project follows, and the consistent fit / predict / transform API that makes scikit-learn so easy to use.",
  objectives: [
    "Explain machine learning in simple words and how it differs from traditional programming",
    "Classify a problem as supervised (regression / classification), unsupervised or reinforcement learning",
    "Describe the end-to-end ML workflow from problem definition to deployment",
    "Use the scikit-learn estimator API: fit, predict, predict_proba, transform, fit_transform and score",
    "Train and evaluate your first model on a built-in dataset",
  ],
  theory: [
    {
      heading: "What is Machine Learning?",
      content: "In traditional programming, a developer writes the rules: `if salary > 50000 and credit_score > 750: approve_loan()`. In machine learning (ML), we give the computer **examples** (data) together with the **answers** (labels), and an algorithm **learns the rules by itself**.\n\nTom Mitchell's classic definition: a program learns from experience E with respect to a task T and performance measure P, if its performance on T, measured by P, improves with experience E. Example: T = detect spam emails, E = 10,000 emails already marked spam / not spam, P = percentage of emails classified correctly.\n\nMathematically, most ML is about finding a function `f` such that `y ≈ f(X)`, where X is the input features (a table of numbers) and y is the target we want to predict. Training means searching for the parameters of `f` that make the error on known examples as small as possible.",
      points: [
        "Traditional programming: Data + Rules → Answers",
        "Machine learning: Data + Answers → Rules (a trained model)",
        "Use ML when rules are too complex to write by hand (images, speech, fraud patterns) or keep changing",
        "Do NOT use ML when a simple, fixed rule works (e.g. GST = 18% of price)",
      ],
    },
    {
      heading: "Key Vocabulary",
      content: "Before writing any code you must be comfortable with the words interviewers use. A **dataset** is a table. Each **row** is a sample (also called observation, instance or record). Each **column** used as input is a **feature** (also called attribute, independent variable, predictor). The column we want to predict is the **target** (label, dependent variable, y).\n\nBy convention in Python, the feature matrix is written as capital `X` (a 2D array of shape `(n_samples, n_features)`) and the target as small `y` (a 1D array of shape `(n_samples,)`).",
      points: [
        "Model: the learned function, e.g. a line y = 3x + 5",
        "Parameters: values learned from data (weights, coefficients, tree splits)",
        "Hyperparameters: settings YOU choose before training (k in KNN, max_depth of a tree)",
        "Training: the process of learning parameters from data",
        "Inference / prediction: using the trained model on new data",
      ],
    },
    {
      heading: "Types of Machine Learning",
      content: "**Supervised learning** uses labelled data: every training row has a known answer. If the target is a number (house price, salary, temperature) it is **regression**. If the target is a category (spam / not spam, disease / healthy, iris species) it is **classification**.\n\n**Unsupervised learning** has no labels. The algorithm finds structure by itself: **clustering** (group customers into segments), **dimensionality reduction** (compress 100 features into 2 for visualisation), **anomaly detection** (unusual transactions).\n\n**Reinforcement learning (RL)** has an **agent** that takes **actions** in an **environment** and receives **rewards**. It learns a policy that maximises total reward by trial and error. Examples: game-playing AI (AlphaGo), robot walking, ad bidding, and RLHF used to fine-tune chatbots.",
      points: [
        "Regression: predict Flipkart delivery time in hours",
        "Binary classification: will a customer churn? (yes / no)",
        "Multi-class classification: classify a news article into sports / politics / tech",
        "Clustering: segment Swiggy users by ordering behaviour",
        "Semi-supervised: few labels + many unlabelled rows; Self-supervised: labels created from the data itself (used to pre-train LLMs)",
      ],
      tip: "Quick test: 'Do I have the right answers for past data?' Yes → supervised. No → unsupervised. 'Does the system learn by acting and getting rewards?' → reinforcement.",
    },
    {
      heading: "The Machine Learning Workflow",
      content: "Every real ML project, from a college mini-project to a production system at a bank, follows roughly the same steps. Interviewers often ask you to 'walk through an ML project' — answer with this list.",
      points: [
        "1. Define the problem and success metric (e.g. reduce fraud loss; metric = recall at 95% precision)",
        "2. Collect data (databases, APIs, logs, CSV files)",
        "3. Explore the data (EDA): shapes, missing values, distributions, correlations",
        "4. Preprocess: clean, impute missing values, encode categories, scale numbers",
        "5. Split into train and test sets (and validation / cross-validation)",
        "6. Train baseline and candidate models",
        "7. Evaluate on unseen data with the right metric; tune hyperparameters",
        "8. Deploy (API, batch job, app) and monitor for data drift; retrain when needed",
      ],
      tip: "Always build a simple baseline first (e.g. predict the most common class). A fancy model that cannot beat the baseline is useless.",
    },
    {
      heading: "The scikit-learn Estimator API",
      content: "scikit-learn (imported as `sklearn`) is the most popular classical ML library in Python. Its biggest strength is a **consistent API**: every algorithm is a class with the same methods, so once you learn one, you know them all.\n\nAn **estimator** is any object that learns from data with `fit()`. A **predictor** also has `predict()`. A **transformer** has `transform()` that changes data (scaling, encoding, PCA). Learned values are stored in attributes ending with an underscore, like `coef_`, `classes_`, `mean_`.",
      syntax: `from sklearn.linear_model import LogisticRegression

model = LogisticRegression(max_iter=1000)   # 1. create (set hyperparameters)
model.fit(X_train, y_train)                 # 2. learn parameters
y_pred = model.predict(X_test)              # 3. predict labels
proba = model.predict_proba(X_test)         # class probabilities
acc = model.score(X_test, y_test)           # accuracy (R² for regressors)

from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)   # learn mean/std AND transform
X_test_s = scaler.transform(X_test)         # only transform (no re-fitting!)
`,
      points: [
        "fit(X, y) → learns from data and returns self",
        "predict(X) → outputs labels or numbers",
        "transform(X) → returns modified features",
        "fit_transform(X) → fit then transform in one step (use only on training data)",
        "score(X, y) → default metric: accuracy for classifiers, R² for regressors",
      ],
    },
    {
      heading: "Built-in Datasets and Why We Split Data",
      content: "scikit-learn ships small datasets so you can practise without downloading: `load_iris` (150 flowers, 3 species), `load_breast_cancer` (569 tumours, benign/malignant), `load_diabetes` (442 patients, disease progression number), `load_wine`, plus generators like `make_classification`, `make_regression` and `make_blobs`.\n\nWe never judge a model on the same data it was trained on — that is like giving students the exam paper in advance. We hold back a **test set** (commonly 20-25%) that the model never sees during training, and report performance on it. This estimates how the model will perform on future, real-world data (its **generalisation**).",
      tip: "Use `random_state=42` (any fixed number) so your split and results are reproducible — interviewers and teammates can rerun and get the same numbers.",
    },
  ],
  examples: [
    {
      title: "Explore a Built-in Dataset",
      scenario: "Before modelling, you want to understand the Iris dataset: how many rows, which features and what the target classes are.",
      steps: [
        "Install once: pip install scikit-learn pandas numpy",
        "Create main.py and paste the code",
        "Run with: python main.py",
        "Compare your output with the result below",
      ],
      code: `from sklearn.datasets import load_iris
import pandas as pd

iris = load_iris(as_frame=True)
df = iris.frame                      # features + target in one DataFrame

print("Shape:", df.shape)
print("Features:", iris.feature_names)
print("Classes:", iris.target_names.tolist())
print(df["target"].value_counts().sort_index().to_dict())
print(df.head(3).to_string())
`,
      python: {
        files: {
          "main.py": `from sklearn.datasets import load_iris
import pandas as pd

iris = load_iris(as_frame=True)
df = iris.frame                      # features + target in one DataFrame

print("Shape:", df.shape)
print("Features:", iris.feature_names)
print("Classes:", iris.target_names.tolist())
print(df["target"].value_counts().sort_index().to_dict())
print(df.head(3).to_string())
`,
        },
      },
      result: "Shape: (150, 5)\nFeatures: ['sepal length (cm)', 'sepal width (cm)', 'petal length (cm)', 'petal width (cm)']\nClasses: ['setosa', 'versicolor', 'virginica']\n{0: 50, 1: 50, 2: 50}\n   sepal length (cm)  sepal width (cm)  petal length (cm)  petal width (cm)  target\n0                5.1               3.5                1.4               0.2       0\n1                4.9               3.0                1.4               0.2       0\n2                4.7               3.2                1.3               0.2       0",
      explanation: "The dataset has 150 rows and 4 numeric features plus a target column. Classes 0, 1, 2 map to setosa, versicolor and virginica, with 50 flowers each — a perfectly balanced multi-class classification problem.",
    },
    {
      title: "Your First Classifier: fit, predict, score",
      scenario: "Train a model that predicts the iris species from petal and sepal measurements, and check accuracy on unseen flowers.",
      steps: [
        "Load features X and target y",
        "Split into 75% train and 25% test with stratify=y",
        "Create a DecisionTreeClassifier, fit on train, predict on test",
        "Compute accuracy with accuracy_score and model.score",
      ],
      code: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y)

model = DecisionTreeClassifier(max_depth=3, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("Train size:", len(X_train), "Test size:", len(X_test))
print("First 10 predictions:", y_pred[:10])
print("First 10 actual     :", y_test[:10])
print("Accuracy:", round(accuracy_score(y_test, y_pred), 3))
print("Same via score():", round(model.score(X_test, y_test), 3))
`,
      python: {
        files: {
          "main.py": `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y)

model = DecisionTreeClassifier(max_depth=3, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("Train size:", len(X_train), "Test size:", len(X_test))
print("First 10 predictions:", y_pred[:10])
print("First 10 actual     :", y_test[:10])
print("Accuracy:", round(accuracy_score(y_test, y_pred), 3))
print("Same via score():", round(model.score(X_test, y_test), 3))
`,
        },
      },
      result: "Train size: 112 Test size: 38\nFirst 10 predictions: [0 1 1 1 0 1 1 2 2 2]\nFirst 10 actual     : [0 1 1 1 0 1 2 2 2 2]\nAccuracy: 0.895\nSame via score(): 0.895",
      explanation: "fit() learned decision rules from 112 flowers. predict() applied those rules to 38 unseen flowers. Accuracy is the fraction of correct predictions. model.score() gives the same number because accuracy is the default score for classifiers. stratify=y keeps the same class proportions in train and test.",
    },
    {
      title: "Regression vs Classification Side by Side",
      scenario: "Show that the same fit/predict API works for a regression problem (predicting a number) on the diabetes dataset.",
      steps: [
        "Load the diabetes dataset (target = disease progression after one year)",
        "Split, fit a LinearRegression, predict",
        "score() now returns R² instead of accuracy",
      ],
      code: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

X, y = load_diabetes(return_X_y=True)
print("X shape:", X.shape, "| y sample:", y[:3])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

reg = LinearRegression()
reg.fit(X_train, y_train)
preds = reg.predict(X_test[:3])
print("Predicted:", preds.round(1))
print("Actual   :", y_test[:3])
print("R2 on test:", round(reg.score(X_test, y_test), 3))
`,
      python: {
        files: {
          "main.py": `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

X, y = load_diabetes(return_X_y=True)
print("X shape:", X.shape, "| y sample:", y[:3])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)

reg = LinearRegression()
reg.fit(X_train, y_train)
preds = reg.predict(X_test[:3])
print("Predicted:", preds.round(1))
print("Actual   :", y_test[:3])
print("R2 on test:", round(reg.score(X_test, y_test), 3))
`,
        },
      },
      result: "X shape: (442, 10) | y sample: [151.  75. 141.]\nPredicted: [139.5 179.5 134. ]\nActual   : [219.  70. 202.]\nR2 on test: 0.453",
      explanation: "The target is a continuous number, so this is regression. The API is identical: create, fit, predict, score. For regressors, score() returns R² (1.0 is perfect, 0 means no better than predicting the mean). An R² around 0.45 is typical for this noisy medical dataset.",
    },
    {
      title: "Transformers: fit_transform vs transform",
      scenario: "Understand how a transformer like StandardScaler learns statistics from training data and then applies them to test data.",
      steps: [
        "Create small train and test arrays",
        "fit_transform on train: learns mean and std, then scales",
        "transform on test: uses the train mean and std (no new learning)",
        "Inspect the learned attributes mean_ and scale_",
      ],
      code: `import numpy as np
from sklearn.preprocessing import StandardScaler

X_train = np.array([[20, 30000], [30, 50000], [40, 70000]], dtype=float)
X_test = np.array([[35, 60000]], dtype=float)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

print("Learned mean_:", scaler.mean_.tolist())
print("Learned scale_:", scaler.scale_.round(2).tolist())
print("Scaled train:\\n", X_train_s.round(3))
print("Scaled test:", X_test_s.round(3))
`,
      python: {
        files: {
          "main.py": `import numpy as np
from sklearn.preprocessing import StandardScaler

X_train = np.array([[20, 30000], [30, 50000], [40, 70000]], dtype=float)
X_test = np.array([[35, 60000]], dtype=float)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

print("Learned mean_:", scaler.mean_.tolist())
print("Learned scale_:", scaler.scale_.round(2).tolist())
print("Scaled train:\\n", X_train_s.round(3))
print("Scaled test:", X_test_s.round(3))
`,
        },
      },
      result: "Learned mean_: [30.0, 50000.0]\nLearned scale_: [8.16, 16329.93]\nScaled train:\n [[-1.225 -1.225]\n [ 0.     0.   ]\n [ 1.225  1.225]]\nScaled test: [[0.612 0.612]]",
      explanation: "StandardScaler computes z = (x - mean) / std for each column. The mean and std are learned only from training data (stored in mean_ and scale_). The test row is scaled with those same values. Re-fitting on test data would leak test information and give a slightly different, inconsistent scale.",
    },
    {
      title: "Baseline Model with DummyClassifier",
      scenario: "Before celebrating 95% accuracy on breast cancer data, check what a 'no-brain' model would score.",
      steps: [
        "Load breast cancer data (binary classification)",
        "Fit DummyClassifier(strategy='most_frequent') — always predicts the majority class",
        "Fit a real LogisticRegression and compare",
      ],
      code: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y)

baseline = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)
model = LogisticRegression(max_iter=5000).fit(X_train, y_train)

print("Baseline accuracy:", round(baseline.score(X_test, y_test), 3))
print("Logistic accuracy:", round(model.score(X_test, y_test), 3))
`,
      python: {
        files: {
          "main.py": `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y)

baseline = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)
model = LogisticRegression(max_iter=5000).fit(X_train, y_train)

print("Baseline accuracy:", round(baseline.score(X_test, y_test), 3))
print("Logistic accuracy:", round(model.score(X_test, y_test), 3))
`,
        },
      },
      result: "Baseline accuracy: 0.629\nLogistic accuracy: 0.958",
      explanation: "About 63% of tumours are benign, so a model that always says 'benign' already gets ~63% accuracy. Logistic regression reaches ~95%, a real improvement. Always report your model next to a baseline so the number has context.",
    },
  ],
  interview: [
    { q: "What is machine learning? How is it different from traditional programming?", a: "Machine learning is a field of AI where algorithms learn patterns from data instead of being explicitly programmed with rules. In traditional programming we provide rules and data to get answers; in ML we provide data and answers (labels) and the algorithm produces the rules (the model), which can then predict answers for new data.", level: "Easy" },
    { q: "Explain the difference between supervised, unsupervised and reinforcement learning with examples.", a: "Supervised learning learns from labelled data (inputs with known outputs), e.g. predicting house prices (regression) or spam detection (classification). Unsupervised learning finds patterns in unlabelled data, e.g. customer segmentation with K-Means or dimensionality reduction with PCA. Reinforcement learning trains an agent to take actions in an environment to maximise cumulative reward, e.g. game playing, robotics, or RLHF for LLMs.", level: "Easy" },
    { q: "What is the difference between regression and classification?", a: "Both are supervised. Regression predicts a continuous numeric value (salary, temperature). Classification predicts a discrete category (fraud / not fraud, digit 0-9). Note that logistic regression, despite its name, is a classification algorithm — it outputs class probabilities.", level: "Easy" },
    { q: "What are features and labels?", a: "Features (X) are the input variables used to make a prediction, such as age, income and city. The label or target (y) is the output we want to predict, such as whether the loan defaults. X is usually a 2D array of shape (n_samples, n_features) and y a 1D array of length n_samples.", level: "Easy" },
    { q: "What is the difference between a parameter and a hyperparameter?", a: "Parameters are learned from data during training — for example the coefficients of linear regression or the split thresholds in a decision tree. Hyperparameters are set before training and control the learning process — for example learning rate, number of trees, max_depth, k in KNN, or regularisation strength C. Hyperparameters are tuned using validation data or cross-validation.", level: "Medium" },
    { q: "Walk me through the steps of a typical ML project.", a: "1) Understand the business problem and choose a success metric. 2) Collect data. 3) Exploratory data analysis. 4) Clean and preprocess (missing values, encoding, scaling, feature engineering). 5) Split data into train/validation/test. 6) Train a baseline, then stronger models. 7) Evaluate with appropriate metrics and tune hyperparameters with cross-validation. 8) Final evaluation on the untouched test set. 9) Deploy (API / batch) and 10) monitor performance and data drift, retraining when needed.", level: "Medium" },
    { q: "In scikit-learn, what is the difference between fit, transform and fit_transform?", a: "fit() learns parameters from data (e.g. the mean and std for StandardScaler). transform() applies the learned parameters to data. fit_transform() does both in one call and is used on training data only. On validation/test data you must call only transform() so that the same training statistics are used — otherwise you introduce data leakage and inconsistent scaling.", level: "Medium" },
    { q: "Why do we split data into training and test sets?", a: "To estimate how well the model generalises to unseen data. If we evaluate on training data the score is optimistically biased because the model may have memorised it (overfitting). The test set simulates future data and must not influence any training or tuning decisions.", level: "Easy" },
    { q: "What does model.score() return in scikit-learn?", a: "For classifiers it returns mean accuracy on the given data. For regressors it returns the coefficient of determination R². For clustering estimators like KMeans, score returns the negative inertia. If you need other metrics, use functions from sklearn.metrics.", level: "Medium" },
    { q: "When should you NOT use machine learning?", a: "When a simple deterministic rule solves the problem, when there is not enough quality data, when the cost of errors is unacceptable and the model cannot be explained, or when the pattern does not exist in the data. ML adds complexity: data pipelines, monitoring, retraining. Start with rules or heuristics if they work well enough.", level: "Medium" },
    { q: "What is a baseline model and why is it important?", a: "A baseline is the simplest reasonable predictor, e.g. always predicting the majority class (DummyClassifier) or the mean value (DummyRegressor). It sets the minimum score any useful model must beat. For imbalanced data, a 99% accuracy might be the baseline itself, which reveals that accuracy is the wrong metric.", level: "Medium" },
    { q: "What is the difference between semi-supervised and self-supervised learning?", a: "Semi-supervised learning uses a small amount of labelled data plus a large amount of unlabelled data, e.g. pseudo-labelling. Self-supervised learning creates labels automatically from the data itself — for example predicting the next word in text or a masked patch in an image. Self-supervised pre-training is how large language models and many vision models are built.", level: "Hard" },
  ],
  practice: [
    {
      task: "Classify each problem as regression, binary classification, multi-class classification, clustering or reinforcement learning: (a) predict tomorrow's Sensex closing value, (b) group 1 lakh customers into marketing segments without labels, (c) detect whether a UPI transaction is fraud, (d) recognise handwritten digits 0-9, (e) teach a robot to balance a pole by trial and error.",
      hint: "Ask: is there a label? Is it a number or a category? How many categories?",
      solution: "(a) Regression — continuous number.\n(b) Clustering (unsupervised) — no labels.\n(c) Binary classification — fraud / not fraud.\n(d) Multi-class classification — 10 classes.\n(e) Reinforcement learning — agent, actions, rewards.",
    },
    {
      task: "Load the wine dataset with load_wine(as_frame=True). Print the number of samples, number of features, the class names and the count of samples per class.",
      hint: "Use data.frame.shape, data.feature_names, data.target_names and value_counts().",
      solution: `from sklearn.datasets import load_wine

data = load_wine(as_frame=True)
df = data.frame
print("Samples:", df.shape[0])
print("Features:", len(data.feature_names))
print("Classes:", list(data.target_names))
print(df["target"].value_counts().sort_index())
# Samples: 178, Features: 13, Classes: class_0, class_1, class_2 (59, 71, 48)`,
    },
    {
      task: "Train a KNeighborsClassifier (n_neighbors=5) on the wine dataset with a 70/30 stratified split (random_state=0) and print the test accuracy. Then compare with a DummyClassifier baseline.",
      hint: "Same fit / score pattern as the iris example. Import KNeighborsClassifier from sklearn.neighbors.",
      solution: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.dummy import DummyClassifier

X, y = load_wine(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)

knn = KNeighborsClassifier(n_neighbors=5).fit(X_tr, y_tr)
dummy = DummyClassifier(strategy="most_frequent").fit(X_tr, y_tr)
print("KNN accuracy:", round(knn.score(X_te, y_te), 3))
print("Baseline    :", round(dummy.score(X_te, y_te), 3))
# KNN is around 0.7 here because features are not scaled (we fix this on Day 2);
# baseline is about 0.4.`,
    },
    {
      task: "Write a function evaluate(model, X, y) that splits the data 80/20 (random_state=42), fits the model and returns the test score. Use it to compare LinearRegression and DecisionTreeRegressor(random_state=42) on load_diabetes.",
      hint: "Because both models follow the same API, one function works for any estimator.",
      solution: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor

def evaluate(model, X, y):
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
    model.fit(X_tr, y_tr)
    return model.score(X_te, y_te)

X, y = load_diabetes(return_X_y=True)
print("Linear R2:", round(evaluate(LinearRegression(), X, y), 3))
print("Tree R2  :", round(evaluate(DecisionTreeRegressor(random_state=42), X, y), 3))
# Linear ~0.45, unpruned tree is much worse (often near 0 or negative) because it overfits.`,
    },
  ],
  quiz: [
    { question: "Predicting whether an email is spam or not is an example of:", options: ["Regression", "Binary classification", "Clustering", "Reinforcement learning"], answer: 1, explanation: "The target has two categories (spam / not spam), so it is binary classification, a type of supervised learning." },
    { question: "Which of these is a hyperparameter?", options: ["Coefficients of linear regression", "max_depth of a decision tree", "The mean learned by StandardScaler", "Split thresholds inside a tree"], answer: 1, explanation: "max_depth is chosen before training. The others are learned from data during fit()." },
    { question: "On the test set you should call:", options: ["scaler.fit_transform(X_test)", "scaler.fit(X_test)", "scaler.transform(X_test)", "scaler.fit(X_train + X_test)"], answer: 2, explanation: "Only transform the test set using statistics learned from the training set; fitting on test data causes leakage." },
    { question: "For a scikit-learn regressor, model.score(X, y) returns:", options: ["Accuracy", "Mean squared error", "R² (coefficient of determination)", "Mean absolute error"], answer: 2, explanation: "Regressors return R² by default; classifiers return accuracy." },
    { question: "Grouping customers into segments when no labels exist is:", options: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Regression"], answer: 1, explanation: "No labels means unsupervised learning; specifically clustering." },
    { question: "What does stratify=y do in train_test_split?", options: ["Shuffles features", "Keeps class proportions the same in train and test", "Scales the target", "Removes duplicates"], answer: 1, explanation: "Stratification preserves the distribution of classes in both splits, which is important for classification, especially with imbalanced data." },
  ],
};
