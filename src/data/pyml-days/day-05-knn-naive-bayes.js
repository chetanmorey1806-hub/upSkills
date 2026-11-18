export default {
  id: "day-05-knn-naive-bayes",
  title: "K-Nearest Neighbours (KNN) and Naive Bayes",
  module: "Module 2: Supervised Learning",
  day: 5,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Two simple but powerful classifiers that every ML interview touches: KNN, which predicts by looking at the closest examples, and Naive Bayes, which applies Bayes' theorem with a bold independence assumption. Learn how they work, their hyperparameters, strengths, weaknesses and when to use each.",
  objectives: [
    "Explain how KNN classifies and regresses using distances",
    "Choose k and a distance metric, and understand why scaling is essential for KNN",
    "Describe the curse of dimensionality and KNN's prediction cost",
    "Apply Bayes' theorem and explain the 'naive' independence assumption",
    "Pick between GaussianNB, MultinomialNB and BernoulliNB and use Laplace smoothing",
  ],
  theory: [
    {
      heading: "KNN Intuition: 'Tell Me Who Your Neighbours Are'",
      content: "To classify a new point, KNN finds the **k** training points closest to it and takes a **majority vote** of their labels (classification) or the **average** of their values (regression). If 4 of your 5 nearest neighbours bought a product, KNN predicts you will too.\n\nKNN is a **lazy learner** (instance-based): `fit()` only stores the training data. All the work happens at `predict()`, when distances to every stored point are computed. It is **non-parametric** — it makes no assumption about the shape of the decision boundary, which can be very irregular.",
      points: [
        "Training: O(1) — just store data (sklearn may build a KD-tree / Ball-tree to speed up search)",
        "Prediction: O(n·d) per query with brute force — slow for millions of rows",
        "weights='distance' gives closer neighbours a bigger vote",
      ],
    },
    {
      heading: "Distance Metrics",
      content: "**Euclidean** (straight-line, L2): √Σ(xᵢ − yᵢ)². Default in sklearn (minkowski with p=2).\n\n**Manhattan** (city-block, L1): Σ|xᵢ − yᵢ|. More robust when features have outliers or in high dimensions.\n\n**Minkowski** generalises both: (Σ|xᵢ − yᵢ|^p)^(1/p).\n\n**Cosine** distance = 1 − cosine similarity, compares direction rather than magnitude — popular for text and embeddings.\n\nBecause KNN is purely distance-based, **feature scaling is mandatory**. Income in rupees (lakhs) would completely drown out age in years.",
      syntax: `from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
KNeighborsClassifier(n_neighbors=5, weights="uniform", metric="minkowski", p=2)`,
    },
    {
      heading: "Choosing k: Bias-Variance in KNN",
      content: "**Small k** (k = 1): the boundary follows every training point, including noise → low bias, high variance → **overfitting**. Training accuracy with k=1 is 100%.\n\n**Large k**: predictions are smoothed over many points; with k = n it always predicts the majority class → high bias → **underfitting**.\n\nPick k with cross-validation. A common starting point is √n. Use an **odd k** in binary classification to avoid ties.",
      tip: "Plot validation accuracy vs k (an 'elbow' or peak). In interviews, say 'k is a hyperparameter controlling the bias-variance trade-off; I tune it with cross-validation'.",
    },
    {
      heading: "Curse of Dimensionality",
      content: "As the number of features grows, data becomes sparse: in 100 dimensions, all points end up roughly the same distance from each other, so 'nearest' neighbours are not really near. KNN's accuracy drops and it needs exponentially more data.\n\nRemedies: feature selection, dimensionality reduction (PCA) before KNN, or a different algorithm. For very large datasets, approximate nearest neighbour libraries (FAISS, Annoy, HNSW) are used — the same idea powers vector databases for LLM retrieval (RAG).",
    },
    {
      heading: "Bayes' Theorem and Naive Bayes",
      content: "Bayes' theorem: `P(class | features) = P(features | class) · P(class) / P(features)`.\n\n**P(class)** = prior (how common the class is), **P(features | class)** = likelihood, **P(class | features)** = posterior. We pick the class with the highest posterior; P(features) is the same for every class so it can be ignored.\n\nComputing P(x1, x2, …, xn | class) jointly is impossible with many features. Naive Bayes makes the **naive assumption** that features are **conditionally independent given the class**, so the likelihood becomes a simple product: P(x1|c)·P(x2|c)·…·P(xn|c). The assumption is almost never true (words like 'free' and 'offer' are correlated), yet the classifier works surprisingly well, especially for text.",
      syntax: `posterior(c) ∝ P(c) · Π P(xᵢ | c)
log-space (avoids underflow): log P(c) + Σ log P(xᵢ | c)`,
    },
    {
      heading: "Types of Naive Bayes and Laplace Smoothing",
      content: "**GaussianNB**: continuous features, assumes each feature is normally distributed within a class (learns mean and variance per class).\n\n**MultinomialNB**: count data — word counts or TF-IDF in text classification. The classic spam filter.\n\n**BernoulliNB**: binary features (word present / absent).\n\n**ComplementNB**: variant of Multinomial that works better on imbalanced text.\n\n**Laplace (additive) smoothing** (`alpha=1.0`): if a word never appeared in spam training emails, P(word|spam) = 0 and the whole product becomes 0. Adding alpha to every count prevents zero probabilities.",
      points: [
        "Pros: extremely fast, works with small data, handles many features, good text baseline",
        "Cons: independence assumption, probability estimates are often poorly calibrated (too close to 0 or 1)",
        "Generative model (models P(x|y)) vs logistic regression, a discriminative model (models P(y|x) directly)",
      ],
    },
  ],
  examples: [
    {
      title: "KNN from Scratch vs sklearn",
      scenario: "Understand exactly what KNN does by coding the vote yourself, then confirm with sklearn.",
      steps: [
        "Create 8 labelled 2D points (two classes)",
        "Compute Euclidean distances from a new point",
        "Take the 3 nearest labels and vote",
        "Compare with KNeighborsClassifier",
      ],
      code: `import numpy as np
from collections import Counter
from sklearn.neighbors import KNeighborsClassifier

X = np.array([[1, 2], [2, 3], [3, 1], [2, 1], [6, 5], [7, 7], [8, 6], [7, 5]])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])
new = np.array([5, 4])

dist = np.sqrt(((X - new) ** 2).sum(axis=1))
nearest = np.argsort(dist)[:3]
print("Distances:", dist.round(2))
print("3 nearest idx:", nearest, "labels:", y[nearest])
print("Manual vote ->", Counter(y[nearest]).most_common(1)[0][0])

knn = KNeighborsClassifier(n_neighbors=3).fit(X, y)
print("sklearn ->", knn.predict([new])[0], "proba:", knn.predict_proba([new])[0])
`,
      python: { files: { "main.py": `import numpy as np
from collections import Counter
from sklearn.neighbors import KNeighborsClassifier

X = np.array([[1, 2], [2, 3], [3, 1], [2, 1], [6, 5], [7, 7], [8, 6], [7, 5]])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])
new = np.array([5, 4])

dist = np.sqrt(((X - new) ** 2).sum(axis=1))
nearest = np.argsort(dist)[:3]
print("Distances:", dist.round(2))
print("3 nearest idx:", nearest, "labels:", y[nearest])
print("Manual vote ->", Counter(y[nearest]).most_common(1)[0][0])

knn = KNeighborsClassifier(n_neighbors=3).fit(X, y)
print("sklearn ->", knn.predict([new])[0], "proba:", knn.predict_proba([new])[0])
` } },
      result: "Distances: [4.47 3.16 3.61 4.24 1.41 3.61 3.61 2.24]\n3 nearest idx: [4 7 1] labels: [1 1 0]\nManual vote -> 1\nsklearn -> 1 proba: [0.33333333 0.66666667]",
      explanation: "The three closest points belong to class 1, so both the manual vote and sklearn predict 1. predict_proba for KNN is simply the fraction of neighbours in each class.",
    },
    {
      title: "Choosing k with Cross-Validation",
      scenario: "On the breast cancer data, find a good k by comparing 5-fold cross-validated accuracy for several values.",
      steps: [
        "Build a pipeline StandardScaler → KNN",
        "Loop over k = 1, 3, 5, … 25",
        "Compute mean 5-fold CV accuracy and print the best k",
      ],
      code: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

X, y = load_breast_cancer(return_X_y=True)
scores = {}
for k in [1, 3, 5, 7, 9, 11, 15, 25]:
    pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k))
    scores[k] = cross_val_score(pipe, X, y, cv=5).mean()
    print(f"k={k:2d} CV accuracy={scores[k]:.4f}")

best = max(scores, key=scores.get)
print("Best k:", best)
`,
      python: { files: { "main.py": `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

X, y = load_breast_cancer(return_X_y=True)
scores = {}
for k in [1, 3, 5, 7, 9, 11, 15, 25]:
    pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k))
    scores[k] = cross_val_score(pipe, X, y, cv=5).mean()
    print(f"k={k:2d} CV accuracy={scores[k]:.4f}")

best = max(scores, key=scores.get)
print("Best k:", best)
` } },
      result: "k= 1 CV accuracy=0.9543\nk= 3 CV accuracy=0.9595\nk= 5 CV accuracy=0.9649\nk= 7 CV accuracy=0.9701\nk= 9 CV accuracy=0.9666\nk=11 CV accuracy=0.9649\nk=15 CV accuracy=0.9614\nk=25 CV accuracy=0.9526\nBest k: 7",
      explanation: "k = 1 overfits (each prediction depends on a single, possibly noisy neighbour). Accuracy improves as k increases, then flattens or falls slightly as the boundary over-smooths. You will automate this search with GridSearchCV on Day 9.",
    },
    {
      title: "KNN Regression: Predicting Flat Rent",
      scenario: "Predict monthly rent from area and distance to the metro station by averaging the rents of similar flats.",
      steps: [
        "Create a small dataset of flats",
        "Fit KNeighborsRegressor with k=3 and weights='distance' inside a scaling pipeline",
        "Predict rent for a new flat",
      ],
      code: `import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsRegressor

# [area_sqft, km_to_metro]
X = np.array([[500, 0.5], [650, 1.0], [800, 0.8], [900, 3.0],
              [1000, 2.5], [1200, 0.7], [1500, 4.0], [700, 5.0]])
rent = np.array([18000, 20000, 25000, 21000, 24000, 35000, 30000, 14000])

model = make_pipeline(StandardScaler(),
                      KNeighborsRegressor(n_neighbors=3, weights="distance"))
model.fit(X, rent)
for flat in [[850, 1.0], [1100, 3.5]]:
    print(flat, "-> predicted rent:", round(model.predict([flat])[0]))
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsRegressor

# [area_sqft, km_to_metro]
X = np.array([[500, 0.5], [650, 1.0], [800, 0.8], [900, 3.0],
              [1000, 2.5], [1200, 0.7], [1500, 4.0], [700, 5.0]])
rent = np.array([18000, 20000, 25000, 21000, 24000, 35000, 30000, 14000])

model = make_pipeline(StandardScaler(),
                      KNeighborsRegressor(n_neighbors=3, weights="distance"))
model.fit(X, rent)
for flat in [[850, 1.0], [1100, 3.5]]:
    print(flat, "-> predicted rent:", round(model.predict([flat])[0]))
` } },
      result: "[850, 1.0] -> predicted rent: 23831\n[1100, 3.5] -> predicted rent: 24090",
      explanation: "For regression KNN returns the (distance-weighted) average target of the k nearest flats. Scaling ensures 1 km to the metro matters comparably to a few hundred square feet. KNN cannot predict beyond the range of training targets — it never extrapolates.",
    },
    {
      title: "Gaussian Naive Bayes on Iris",
      scenario: "Train GaussianNB on continuous flower measurements and inspect what it learns.",
      steps: [
        "Split iris data",
        "Fit GaussianNB and evaluate",
        "Print class priors and the learned per-class means (theta_)",
      ],
      code: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB

X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

nb = GaussianNB().fit(X_tr, y_tr)
print("Test accuracy:", round(nb.score(X_te, y_te), 3))
print("Class priors:", nb.class_prior_.round(3))
print("Mean petal length per class:", nb.theta_[:, 2].round(2))
print("Probabilities for first test flower:", nb.predict_proba(X_te[:1]).round(4))
`,
      python: { files: { "main.py": `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB

X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

nb = GaussianNB().fit(X_tr, y_tr)
print("Test accuracy:", round(nb.score(X_te, y_te), 3))
print("Class priors:", nb.class_prior_.round(3))
print("Mean petal length per class:", nb.theta_[:, 2].round(2))
print("Probabilities for first test flower:", nb.predict_proba(X_te[:1]).round(4))
` } },
      result: "Test accuracy: 0.911\nClass priors: [0.333 0.333 0.333]\nMean petal length per class: [1.49 4.24 5.63]\nProbabilities for first test flower: [[0. 0. 1.]]",
      explanation: "GaussianNB learns, for each class, the mean and variance of every feature, plus the class prior. Petal length differs strongly between species, making them easy to separate. Notice the very confident probabilities — Naive Bayes tends to produce extreme probabilities because it multiplies many likelihoods as if they were independent.",
    },
    {
      title: "Multinomial Naive Bayes Spam Filter",
      scenario: "Build a tiny SMS spam classifier with word counts — the classic Naive Bayes use case.",
      steps: [
        "Write a few labelled messages",
        "Convert text to word counts with CountVectorizer",
        "Train MultinomialNB (alpha=1 Laplace smoothing) in a pipeline",
        "Classify new messages",
      ],
      code: `from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

msgs = [
    "Congratulations you won a free iPhone claim now",
    "Win cash prize free entry reply WIN",
    "Limited offer free recharge click link",
    "Urgent your KYC is pending click link to win reward",
    "Are we meeting for lunch today",
    "Please send the project report by evening",
    "Call me when you reach home",
    "Can you share the notes from class",
]
labels = [1, 1, 1, 1, 0, 0, 0, 0]   # 1 = spam

spam_clf = make_pipeline(CountVectorizer(lowercase=True), MultinomialNB(alpha=1.0))
spam_clf.fit(msgs, labels)

tests = ["free cash reward click now", "send me the class notes", "lunch offer today"]
for t, p in zip(tests, spam_clf.predict_proba(tests)[:, 1]):
    print(f"{p:.3f} spam probability -> {t}")
`,
      python: { files: { "main.py": `from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

msgs = [
    "Congratulations you won a free iPhone claim now",
    "Win cash prize free entry reply WIN",
    "Limited offer free recharge click link",
    "Urgent your KYC is pending click link to win reward",
    "Are we meeting for lunch today",
    "Please send the project report by evening",
    "Call me when you reach home",
    "Can you share the notes from class",
]
labels = [1, 1, 1, 1, 0, 0, 0, 0]   # 1 = spam

spam_clf = make_pipeline(CountVectorizer(lowercase=True), MultinomialNB(alpha=1.0))
spam_clf.fit(msgs, labels)

tests = ["free cash reward click now", "send me the class notes", "lunch offer today"]
for t, p in zip(tests, spam_clf.predict_proba(tests)[:, 1]):
    print(f"{p:.3f} spam probability -> {t}")
` } },
      result: "0.987 spam probability -> free cash reward click now\n0.016 spam probability -> send me the class notes\n0.299 spam probability -> lunch offer today",
      explanation: "CountVectorizer turns each message into word counts. MultinomialNB learns P(word | spam) and P(word | ham) with Laplace smoothing, so unseen words do not zero out the product. Words like 'free', 'click' and 'win' push towards spam. 'lunch offer today' mixes signals, so its probability is in between. On Day 11 you will use TF-IDF on a larger corpus.",
    },
  ],
  interview: [
    { q: "How does KNN work?", a: "KNN stores the training data. For a new point it computes the distance to all training points, selects the k nearest, and predicts the majority class (classification) or the mean target (regression), optionally weighting neighbours by inverse distance. It has no explicit training phase — it is a lazy, instance-based, non-parametric method.", level: "Easy" },
    { q: "How do you choose k in KNN?", a: "Use cross-validation over a range of k values and pick the one with the best validation score. Small k → low bias, high variance (overfitting); large k → high bias (underfitting). Use odd k for binary problems to avoid ties. √n is a rough starting point.", level: "Easy" },
    { q: "Why is feature scaling important for KNN?", a: "KNN relies on distances. A feature with a large numeric range (salary in lakhs) dominates the distance over a feature with a small range (years of experience), so the model effectively ignores the small-range features. Standardisation or min-max scaling gives each feature comparable influence.", level: "Easy" },
    { q: "What are the drawbacks of KNN?", a: "Slow and memory-heavy at prediction time (must store and search all training data); suffers from the curse of dimensionality; sensitive to irrelevant features, scaling and noise; struggles with imbalanced classes (majority class dominates the vote); needs a meaningful distance metric.", level: "Medium" },
    { q: "What is the curse of dimensionality?", a: "As the number of dimensions grows, the volume of the space grows exponentially, data becomes sparse, and distances between points become nearly equal — the ratio of nearest to farthest distance approaches 1. Distance-based methods like KNN and K-Means lose meaning, and models need exponentially more data. Remedies: feature selection, PCA, regularisation, or algorithms less affected by it.", level: "Medium" },
    { q: "Is KNN a parametric or non-parametric model? What about Naive Bayes?", a: "KNN is non-parametric: the 'model' is the training data itself and its complexity grows with data size. Gaussian Naive Bayes is parametric: it learns a fixed number of parameters (mean and variance per feature per class, plus priors) regardless of the number of samples.", level: "Medium" },
    { q: "State Bayes' theorem and explain each term.", a: "P(A|B) = P(B|A)·P(A) / P(B). P(A) is the prior belief, P(B|A) the likelihood of the evidence given A, P(B) the evidence (normalising constant) and P(A|B) the posterior — updated belief after seeing the evidence. In classification, A is the class and B the features.", level: "Easy" },
    { q: "Why is Naive Bayes called 'naive'?", a: "Because it assumes all features are conditionally independent given the class, so the joint likelihood factorises into a product of individual likelihoods. This is rarely true in reality (words in a sentence are related), but the assumption makes the model extremely fast and data-efficient, and the classification decision is often still correct even if probabilities are off.", level: "Easy" },
    { q: "What is Laplace smoothing and why is it needed?", a: "If a feature value (e.g. a word) never appears with a class in training, its estimated probability is 0 and multiplying makes the entire posterior 0, regardless of other evidence. Laplace (additive) smoothing adds a small count alpha (often 1) to every feature count so no probability is exactly zero: P(w|c) = (count(w,c) + α) / (total_c + α·V).", level: "Medium" },
    { q: "Difference between GaussianNB, MultinomialNB and BernoulliNB?", a: "GaussianNB assumes continuous features follow a normal distribution per class. MultinomialNB models counts/frequencies, e.g. word counts or TF-IDF — standard for text classification. BernoulliNB models binary presence/absence features and explicitly penalises the absence of features. Choose based on the type of your features.", level: "Medium" },
    { q: "Generative vs discriminative models — where do Naive Bayes and logistic regression fit?", a: "Generative models learn the joint distribution P(x, y) via P(x|y)·P(y) and can generate data; Naive Bayes is generative. Discriminative models learn P(y|x) or the decision boundary directly; logistic regression, SVM and neural classifiers are discriminative. Generative models often do better with very little data; discriminative models usually win with more data (Ng & Jordan, 2002).", level: "Hard" },
    { q: "How would you speed up KNN on 10 million rows?", a: "Use tree-based indexes (KD-tree, Ball tree) for low dimensions; approximate nearest neighbour search (FAISS, HNSW/hnswlib, Annoy, ScaNN) for high dimensions; reduce dimensionality with PCA; reduce the dataset via prototype selection or clustering; and parallelise queries (n_jobs=-1). Vector databases are built exactly for this problem.", level: "Hard" },
  ],
  practice: [
    {
      task: "Compute by hand: training points A(1,1) class 0, B(2,2) class 0, C(4,4) class 1, D(5,5) class 1, E(3,4) class 1. Predict the class of P(3,3) with k=3 using Euclidean distance.",
      hint: "Compute the distance from P to every point and pick the 3 smallest.",
      solution: "d(A)=√8≈2.83, d(B)=√2≈1.41, d(C)=√2≈1.41, d(D)=√8≈2.83, d(E)=1.0.\n3 nearest: E (class 1), B (class 0), C (class 1) → votes 2 vs 1 → predict class 1.",
    },
    {
      task: "On load_wine, use a pipeline (StandardScaler, KNeighborsClassifier) and compare 5-fold CV accuracy for weights='uniform' vs weights='distance' and for p=1 (Manhattan) vs p=2 (Euclidean) with k=7.",
      hint: "Loop over a list of parameter dicts and use cross_val_score.",
      solution: `from sklearn.datasets import load_wine
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

X, y = load_wine(return_X_y=True)
for w in ["uniform", "distance"]:
    for p in [1, 2]:
        pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=7, weights=w, p=p))
        print(w, "p=", p, round(cross_val_score(pipe, X, y, cv=5).mean(), 4))
# All are around 0.95-0.98; differences are small, which is common. Always verify with CV.`,
    },
    {
      task: "Spam probability by hand: P(spam) = 0.4. P('free'|spam) = 0.30, P('free'|ham) = 0.02, P('meeting'|spam) = 0.01, P('meeting'|ham) = 0.10. Using Naive Bayes, is the message 'free meeting' spam?",
      hint: "Compare P(spam)·P(free|spam)·P(meeting|spam) with the same product for ham, then normalise.",
      solution: "spam score = 0.4 × 0.30 × 0.01 = 0.0012\nham score = 0.6 × 0.02 × 0.10 = 0.0012\nThey are equal → P(spam | message) = 0.0012 / 0.0024 = 0.5. A tie: the strong spam word 'free' is exactly cancelled by the strong ham word 'meeting'.",
    },
    {
      task: "Compare GaussianNB, KNN (k=5, scaled) and LogisticRegression (scaled) on load_breast_cancer with 5-fold cross-validation. Also time how long each takes using time.perf_counter().",
      hint: "Put models in a dict and loop; wrap cross_val_score with timers.",
      solution: `import time
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression

X, y = load_breast_cancer(return_X_y=True)
models = {
    "GaussianNB": GaussianNB(),
    "KNN": make_pipeline(StandardScaler(), KNeighborsClassifier(5)),
    "LogReg": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
}
for name, m in models.items():
    t0 = time.perf_counter()
    s = cross_val_score(m, X, y, cv=5).mean()
    print(f"{name:10s} acc={s:.4f} time={time.perf_counter() - t0:.3f}s")
# Typical: GaussianNB ~0.94, KNN ~0.96-0.97, LogReg ~0.98. NB is the fastest.`,
    },
  ],
  quiz: [
    { question: "KNN with k=1 typically suffers from:", options: ["High bias", "High variance (overfitting)", "Underfitting", "Slow training"], answer: 1, explanation: "With k=1 every prediction copies one neighbour, including noisy ones, so the model overfits." },
    { question: "When does KNN do most of its computation?", options: ["During fit()", "During predict()", "During scaling", "It never computes"], answer: 1, explanation: "KNN is a lazy learner: fit stores data; distances are computed at prediction time." },
    { question: "The 'naive' assumption in Naive Bayes is:", options: ["Features are normally distributed", "Features are conditionally independent given the class", "Classes are balanced", "Data is linearly separable"], answer: 1, explanation: "Conditional independence lets the likelihood factorise into a product of per-feature terms." },
    { question: "Which Naive Bayes variant is the usual choice for word-count text features?", options: ["GaussianNB", "MultinomialNB", "BernoulliNB only", "None"], answer: 1, explanation: "MultinomialNB models count/frequency features such as word counts or TF-IDF." },
    { question: "Laplace smoothing prevents:", options: ["Overfitting in KNN", "Zero probabilities for unseen feature values", "Scaling issues", "Class imbalance"], answer: 1, explanation: "Adding alpha to counts ensures no conditional probability is exactly zero." },
    { question: "Manhattan distance between (1, 2) and (4, 6) is:", options: ["5", "7", "25", "3.5"], answer: 1, explanation: "|4−1| + |6−2| = 3 + 4 = 7. (Euclidean would be 5.)" },
  ],
};
