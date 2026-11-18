export default {
  id: "day-38-classification-metrics",
  title: "Classification: Logistic Regression, Decision Tree, KNN and the Confusion Matrix",
  module: "Module 6: Machine Learning Hands-on",
  day: 38,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Classification predicts a category: spam or not spam, pass or fail, fraud or genuine, apple or orange. Learn three classic classifiers - logistic regression, decision trees and K-Nearest Neighbours (KNN) - train them with scikit-learn, and evaluate them properly with the confusion matrix, accuracy, precision, recall and F1-score. Understand why accuracy alone can be dangerously misleading and how to choose the right metric for the business problem.",
  objectives: [
    "Explain binary vs multi-class classification with real examples",
    "Describe how logistic regression, decision trees and KNN make decisions",
    "Train and compare classifiers with the same scikit-learn workflow",
    "Build and read a confusion matrix (TP, TN, FP, FN)",
    "Calculate precision, recall and F1 and choose the right metric for a scenario"
  ],
  theory: [
    {
      heading: "What is Classification?",
      content: "Classification is supervised learning where the target is a label (category). The model learns from labelled examples and assigns a label to new data. Analogy: a post-office sorter who learns to drop each letter into the correct city bin.",
      points: [
        "Binary classification: two classes - spam/not spam, fraud/genuine, pass/fail, churn/stay. Usually coded 1 (positive class, the thing we look for) and 0.",
        "Multi-class: more than two classes - digit 0-9, type of flower, news category.",
        "Multi-label: several labels at once - a movie can be 'comedy' and 'romance'.",
        "Most classifiers can output a probability (predict_proba). The final label uses a threshold, usually 0.5, which you can move."
      ]
    },
    {
      heading: "Logistic Regression: A Line Plus a Probability",
      content: "Despite its name, logistic regression is a classification model. It computes a weighted score like linear regression (w*x + b), then squeezes it into a probability between 0 and 1 using the sigmoid (S-shaped) function. If the probability is >= 0.5, predict class 1. Analogy: a bank officer adding points for income and credit history, then converting the total into 'chance of repayment'.",
      syntax: `score = w1*x1 + w2*x2 + b
probability = 1 / (1 + e^(-score))      # sigmoid -> between 0 and 1
label = 1 if probability >= 0.5 else 0

from sklearn.linear_model import LogisticRegression
model = LogisticRegression().fit(X_train, y_train)
model.predict(X_new)          # labels
model.predict_proba(X_new)    # [P(class 0), P(class 1)] per row`,
      points: [
        "Fast, simple, explainable: coefficients show which features push towards class 1.",
        "The decision boundary is a straight line (or flat plane) - it struggles with curved patterns.",
        "Scale features (StandardScaler) for best results; scikit-learn applies regularisation by default (parameter C).",
        "Try it in the ML Playground (/tools/ml-playground): add red and blue points, choose Logistic Regression and see the dividing line."
      ]
    },
    {
      heading: "Decision Trees: A Flowchart of Yes/No Questions",
      content: "A decision tree learns a series of if/else questions - 'hours > 4.5?', 'attendance > 75%?' - that split the data into purer and purer groups. Each leaf gives a prediction. Analogy: the game '20 Questions', or a doctor's diagnostic flowchart.",
      syntax: `from sklearn.tree import DecisionTreeClassifier, export_text
tree = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X_train, y_train)
print(export_text(tree, feature_names=["hours", "attendance"]))`,
      points: [
        "Very easy to explain to non-technical people - you can print the rules.",
        "Handles non-linear patterns and does not need feature scaling.",
        "Big danger: an unlimited tree memorises the training data (overfitting). Control it with max_depth, min_samples_leaf.",
        "Many trees combined = Random Forest; trees built one after another to fix errors = Gradient Boosting (XGBoost, LightGBM). These are among the strongest models for tabular data."
      ]
    },
    {
      heading: "K-Nearest Neighbours (KNN): Ask Your Neighbours",
      content: "KNN does not really 'learn' a formula. To classify a new point, it finds the K closest training points (by distance) and takes a majority vote. Analogy: to guess if a new restaurant is good, you ask your 3 friends who live closest to it.",
      syntax: `distance = sqrt((x1 - a1)^2 + (x2 - a2)^2)      # Euclidean distance
from sklearn.neighbors import KNeighborsClassifier
knn = KNeighborsClassifier(n_neighbors=3).fit(X_train, y_train)`,
      points: [
        "Small K (e.g. 1) = very sensitive to noise (overfits); large K = smoother but may blur real boundaries. Use an odd K for two classes to avoid tied votes.",
        "Feature scaling is essential: a feature measured in grams (100-200) will dominate one measured in cm (6-10).",
        "Prediction is slow on huge datasets because it compares with every training point.",
        "The ML Playground lets you change K and watch the coloured regions change."
      ]
    },
    {
      heading: "The Confusion Matrix: Where Exactly Is the Model Wrong?",
      content: "A confusion matrix counts the four possible outcomes for a binary classifier. Imagine a COVID test (positive = has the disease).",
      syntax: `                     Predicted 0      Predicted 1
Actual 0 (negative)     TN               FP   (false alarm)
Actual 1 (positive)     FN (missed)      TP

from sklearn.metrics import confusion_matrix
confusion_matrix(y_true, y_pred)    # [[TN, FP], [FN, TP]]`,
      points: [
        "TP (True Positive): sick person correctly flagged.",
        "TN (True Negative): healthy person correctly cleared.",
        "FP (False Positive, Type I error): healthy person wrongly flagged - a false alarm.",
        "FN (False Negative, Type II error): sick person missed - often the most dangerous error.",
        "In scikit-learn the rows are actual classes and the columns are predicted classes, in sorted label order (0 then 1)."
      ]
    },
    {
      heading: "Accuracy, Precision, Recall and F1 - Choosing the Right Metric",
      content: "Accuracy = (TP + TN) / total. It sounds perfect but misleads on imbalanced data: if only 1% of transactions are fraud, a model that always says 'not fraud' has 99% accuracy and catches zero fraud. So we use precision and recall.",
      syntax: `Accuracy  = (TP + TN) / (TP + TN + FP + FN)
Precision = TP / (TP + FP)    # of all predicted positives, how many were right?
Recall    = TP / (TP + FN)    # of all real positives, how many did we catch?  (sensitivity)
F1        = 2 * Precision * Recall / (Precision + Recall)   # harmonic mean, balances both

from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report`,
      points: [
        "High precision matters when false alarms are costly: spam filter (do not hide important mail), recommending a loan rejection.",
        "High recall matters when missing a positive is costly: cancer screening, fraud detection, safety defects.",
        "Precision-recall trade-off: lowering the threshold catches more positives (recall up) but creates more false alarms (precision down).",
        "F1 is useful when you need one number and classes are imbalanced.",
        "classification_report prints precision, recall, F1 and support for every class at once."
      ],
      tip: "Interview trick: always ask 'What is the cost of a false positive vs a false negative?' before choosing a metric."
    }
  ],
  examples: [
    {
      title: "Confusion Matrix, Precision, Recall and F1 with scikit-learn",
      scenario: "A spam filter was tested on 10 emails (1 = spam). Compare the true labels with the model's predictions and compute every metric.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code and click Run",
        "Draw the 2x2 confusion matrix on paper and label TN, FP, FN, TP",
        "Change one prediction and predict how each metric will change before re-running"
      ],
      code: `from sklearn.metrics import confusion_matrix, accuracy_score, precision_score, recall_score, f1_score

y_true = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0]
y_pred = [1, 0, 0, 1, 0, 1, 1, 0, 1, 1]

cm = confusion_matrix(y_true, y_pred)
print("confusion matrix:", cm.tolist())
print("accuracy:", round(accuracy_score(y_true, y_pred), 2))
print("precision:", round(precision_score(y_true, y_pred), 2))
print("recall:", round(recall_score(y_true, y_pred), 2))
print("F1:", round(f1_score(y_true, y_pred), 2))`,
      python: {
        files: {
          "main.py": `from sklearn.metrics import confusion_matrix, accuracy_score, precision_score, recall_score, f1_score

y_true = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0]
y_pred = [1, 0, 0, 1, 0, 1, 1, 0, 1, 1]

cm = confusion_matrix(y_true, y_pred)
print("confusion matrix:", cm.tolist())
print("accuracy:", round(accuracy_score(y_true, y_pred), 2))
print("precision:", round(precision_score(y_true, y_pred), 2))
print("recall:", round(recall_score(y_true, y_pred), 2))
print("F1:", round(f1_score(y_true, y_pred), 2))
`
        },
        stdin: ""
      },
      result: `confusion matrix: [[3, 2], [1, 4]]
accuracy: 0.7
precision: 0.67
recall: 0.8
F1: 0.73`,
      explanation: "Count position by position: TP = 4 (spam caught), TN = 3 (good mail passed), FP = 2 (good mail wrongly marked spam, positions 7 and 10), FN = 1 (spam missed, position 3). Matrix [[TN, FP], [FN, TP]] = [[3, 2], [1, 4]]. Accuracy = 7/10 = 0.7. Precision = 4/(4+2) = 0.67 - one in three spam flags is a false alarm. Recall = 4/(4+1) = 0.8 - we catch 80% of spam. F1 = 2*0.667*0.8/(0.667+0.8) = 0.73. For a spam filter, the 2 false positives (important mail hidden) may be the bigger worry."
    },
    {
      title: "Logistic Regression vs Decision Tree: Pass or Fail",
      scenario: "Students who studied 1-4 hours failed (0) and 5-8 hours passed (1). Train both models and predict for 2.5 and 6.5 hours, then print the tree's rule.",
      steps: [
        "Open the Python IDE (/tools/python-ide)",
        "Paste the code and click Run",
        "Read the printed tree rule - it is a simple threshold",
        "In the ML Playground (/tools/ml-playground) place similar points and compare the Logistic Regression and KNN boundaries"
      ],
      code: `import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier, export_text

X = np.array([[1], [2], [3], [4], [5], [6], [7], [8]])   # hours
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])                   # 0 = fail, 1 = pass
new = [[2.5], [6.5]]

logreg = LogisticRegression().fit(X, y)
tree = DecisionTreeClassifier(random_state=0).fit(X, y)

print("logistic predictions:", logreg.predict(new).tolist())
print("tree predictions:", tree.predict(new).tolist())
print("logistic train accuracy:", logreg.score(X, y))
print("tree depth:", tree.get_depth())
print(export_text(tree, feature_names=["hours"]))`,
      python: {
        files: {
          "main.py": `import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier, export_text

X = np.array([[1], [2], [3], [4], [5], [6], [7], [8]])   # hours
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])                   # 0 = fail, 1 = pass
new = [[2.5], [6.5]]

logreg = LogisticRegression().fit(X, y)
tree = DecisionTreeClassifier(random_state=0).fit(X, y)

print("logistic predictions:", logreg.predict(new).tolist())
print("tree predictions:", tree.predict(new).tolist())
print("logistic train accuracy:", logreg.score(X, y))
print("tree depth:", tree.get_depth())
print(export_text(tree, feature_names=["hours"]))
`
        },
        stdin: ""
      },
      result: `logistic predictions: [0, 1]
tree predictions: [0, 1]
logistic train accuracy: 1.0
tree depth: 1
|--- hours <= 4.50
|   |--- class: 0
|--- hours >  4.50
|   |--- class: 1`,
      explanation: "The data is perfectly separable at 4.5 hours. The tree finds exactly one question (depth 1): 'hours <= 4.5?' - the midpoint between 4 and 5. Logistic regression learns an S-curve whose 50% point is also at 4.5 because the data is symmetric around it, so 2.5 hours -> fail and 6.5 hours -> pass. Both models get every training row right. Real data overlaps, and then the models start to differ."
    },
    {
      title: "KNN: Apple or Orange?",
      scenario: "Classify fruits by weight (grams) and size (cm) using the 3 nearest neighbours.",
      steps: [
        "Open the Python IDE (/tools/python-ide)",
        "Paste the code and click Run",
        "Look at the distances in the pure-Python version (next example) to see why each fruit was labelled",
        "Notice that weight dominates the distance - think about why scaling matters"
      ],
      code: `from sklearn.neighbors import KNeighborsClassifier

X = [[150, 7.0], [170, 7.5], [140, 6.8], [130, 6.0],
     [180, 9.2], [200, 9.8], [190, 9.0], [210, 10.1]]   # weight g, size cm
y = ["apple", "apple", "apple", "apple",
     "orange", "orange", "orange", "orange"]

knn = KNeighborsClassifier(n_neighbors=3).fit(X, y)
print("predictions:", knn.predict([[160, 7.2], [195, 9.5]]).tolist())
print("train accuracy:", knn.score(X, y))`,
      python: {
        files: {
          "main.py": `from sklearn.neighbors import KNeighborsClassifier

X = [[150, 7.0], [170, 7.5], [140, 6.8], [130, 6.0],
     [180, 9.2], [200, 9.8], [190, 9.0], [210, 10.1]]   # weight g, size cm
y = ["apple", "apple", "apple", "apple",
     "orange", "orange", "orange", "orange"]

knn = KNeighborsClassifier(n_neighbors=3).fit(X, y)
print("predictions:", knn.predict([[160, 7.2], [195, 9.5]]).tolist())
print("train accuracy:", knn.score(X, y))
`
        },
        stdin: ""
      },
      result: `predictions: ['apple', 'orange']
train accuracy: 1.0`,
      explanation: "The 160 g fruit's three nearest neighbours are the 150 g, 170 g and 140 g apples, so it is an apple. The 195 g fruit is closest to the 190 g, 200 g and 180 g oranges. Each training point's 3 neighbours (including itself) share its label, so training accuracy is 1.0. Warning: the distance is almost entirely weight because grams are much bigger numbers than cm - in real projects use StandardScaler first."
    },
    {
      title: "Pure-Python KNN and Metrics (Runs Anywhere)",
      scenario: "Implement the KNN vote and the confusion-matrix metrics by hand to understand exactly what scikit-learn computes.",
      steps: [
        "Open the Python IDE (/tools/python-ide) or any Python 3",
        "Paste the code and click Run",
        "Check the 'nearest' lines - these are the neighbours that voted",
        "Confirm the metrics match the scikit-learn example"
      ],
      code: `# Pure-Python KNN + confusion matrix + metrics
train = [
    ((150, 7.0), "apple"), ((170, 7.5), "apple"), ((140, 6.8), "apple"),
    ((130, 6.0), "apple"), ((180, 9.2), "orange"), ((200, 9.8), "orange"),
    ((190, 9.0), "orange"), ((210, 10.1), "orange"),
]
def knn(point, k=3):
    dists = []
    for (w, s), label in train:
        d = ((w - point[0]) ** 2 + (s - point[1]) ** 2) ** 0.5
        dists.append((d, label))
    dists.sort()
    top = [label for d, label in dists[:k]]
    print("  nearest:", [(round(d, 1), l) for d, l in dists[:k]])
    return max(set(top), key=top.count)
for fruit in [(160, 7.2), (195, 9.5)]:
    print(fruit, "->", knn(fruit))

y_true = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0]
y_pred = [1, 0, 0, 1, 0, 1, 1, 0, 1, 1]
tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
tn = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 0)
fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
print("TP, TN, FP, FN:", tp, tn, fp, fn)
print("confusion matrix:", [[tn, fp], [fn, tp]])
acc = (tp + tn) / len(y_true)
prec = tp / (tp + fp)
rec = tp / (tp + fn)
f1 = 2 * prec * rec / (prec + rec)
print("accuracy:", round(acc, 2))
print("precision:", round(prec, 2))
print("recall:", round(rec, 2))
print("F1:", round(f1, 2))`,
      python: {
        files: {
          "main.py": `# Pure-Python KNN + confusion matrix + metrics
train = [
    ((150, 7.0), "apple"), ((170, 7.5), "apple"), ((140, 6.8), "apple"),
    ((130, 6.0), "apple"), ((180, 9.2), "orange"), ((200, 9.8), "orange"),
    ((190, 9.0), "orange"), ((210, 10.1), "orange"),
]
def knn(point, k=3):
    dists = []
    for (w, s), label in train:
        d = ((w - point[0]) ** 2 + (s - point[1]) ** 2) ** 0.5
        dists.append((d, label))
    dists.sort()
    top = [label for d, label in dists[:k]]
    print("  nearest:", [(round(d, 1), l) for d, l in dists[:k]])
    return max(set(top), key=top.count)
for fruit in [(160, 7.2), (195, 9.5)]:
    print(fruit, "->", knn(fruit))

y_true = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0]
y_pred = [1, 0, 0, 1, 0, 1, 1, 0, 1, 1]
tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
tn = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 0)
fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
print("TP, TN, FP, FN:", tp, tn, fp, fn)
print("confusion matrix:", [[tn, fp], [fn, tp]])
acc = (tp + tn) / len(y_true)
prec = tp / (tp + fp)
rec = tp / (tp + fn)
f1 = 2 * prec * rec / (prec + rec)
print("accuracy:", round(acc, 2))
print("precision:", round(prec, 2))
print("recall:", round(rec, 2))
print("F1:", round(f1, 2))
`
        },
        stdin: ""
      },
      result: `  nearest: [(10.0, 'apple'), (10.0, 'apple'), (20.0, 'apple')]
(160, 7.2) -> apple
  nearest: [(5.0, 'orange'), (5.0, 'orange'), (15.0, 'orange')]
(195, 9.5) -> orange
TP, TN, FP, FN: 4 3 2 1
confusion matrix: [[3, 2], [1, 4]]
accuracy: 0.7
precision: 0.67
recall: 0.8
F1: 0.73`,
      explanation: "The neighbour distances (10.0, 10.0, 20.0) are almost exactly the weight differences (10 g, 10 g, 20 g) - proof that the size in cm hardly matters without scaling. The 'nearest' line prints inside the function before the result line. The metric values are identical to scikit-learn's."
    },
    {
      title: "Use AI to Choose the Right Metric",
      scenario: "Your team is building three classifiers. Ask an AI assistant which metric should be the main one for each, then check the reasoning against what you learned.",
      steps: [
        "Open the AI Prompt Lab (/tools/ai-lab) or claude.ai / ChatGPT / Gemini",
        "Paste the prompt below and run it",
        "Compare the answer with the precision/recall rules from the theory",
        "Ask a follow-up: 'How would you change the decision threshold for case 2?'"
      ],
      code: `You are an ML lead mentoring a junior engineer.
For each project below, choose the PRIMARY evaluation metric (accuracy, precision, recall or F1) and explain the cost of false positives vs false negatives.
1. Detecting fraudulent card transactions (0.5% are fraud).
2. A spam filter for a company's email.
3. Screening X-rays for a serious disease before a doctor reviews them.
4. Classifying customer feedback into 5 balanced topics.
Format: a table with columns Project | Metric | Costly error | Why (one sentence).`,
      prompt: {
        system: "You are an ML lead mentoring a junior engineer. Be precise and practical.",
        user: "For each project below, choose the PRIMARY evaluation metric (accuracy, precision, recall or F1) and explain the cost of false positives vs false negatives.\n1. Detecting fraudulent card transactions (0.5% are fraud).\n2. A spam filter for a company's email.\n3. Screening X-rays for a serious disease before a doctor reviews them.\n4. Classifying customer feedback into 5 balanced topics.\nFormat: a table with columns Project | Metric | Costly error | Why (one sentence)."
      },
      result: "A table similar to: Fraud -> recall (or F1 / PR-AUC), missing fraud is costly and accuracy is useless at 0.5% positives; Spam -> precision, hiding real mail is costly; X-ray screening -> recall, a missed disease is dangerous and a doctor reviews flags anyway; Balanced topics -> accuracy (or macro F1), classes are balanced and errors cost about the same.",
      explanation: "There is no universally best metric - it depends on the cost of each error. The AI answer is a good draft; your job is to verify it matches the business context (e.g. a bank may also care about precision so it does not block too many genuine customers)."
    }
  ],
  tools: [
    { name: "In-app Python IDE", use: "Train and evaluate classifiers with scikit-learn", url: "/tools/python-ide" },
    { name: "ML Playground", use: "Visualise KNN and logistic regression decision boundaries by clicking points", url: "/tools/ml-playground" },
    { name: "scikit-learn", use: "LogisticRegression, DecisionTreeClassifier, KNeighborsClassifier, metrics", url: "https://scikit-learn.org" },
    { name: "AI Prompt Lab", use: "Ask an AI to explain metrics or review your evaluation", url: "/tools/ai-lab" }
  ],
  interview: [
    { q: "Why is logistic regression called regression if it is used for classification?", a: "It regresses (fits) the log-odds of the positive class as a linear function of the features, then the sigmoid converts that to a probability, and a threshold converts the probability to a class.", level: "Medium" },
    { q: "Explain precision and recall with an example.", a: "In fraud detection, precision = of transactions we flagged, how many were really fraud; recall = of all real frauds, how many we flagged. High precision means few false alarms; high recall means few missed frauds.", level: "Easy" },
    { q: "Why can accuracy be misleading?", a: "With imbalanced classes, predicting the majority class gives high accuracy while completely failing on the minority class. Example: 99% accuracy by always predicting 'no fraud' when 1% are fraud.", level: "Easy" },
    { q: "What is the F1-score and when do you use it?", a: "The harmonic mean of precision and recall: 2PR/(P+R). It is high only when both are high. Use it for imbalanced data when you need a single balanced number.", level: "Medium" },
    { q: "How does KNN work and what are its weaknesses?", a: "It labels a point by majority vote of its K nearest training points. Weaknesses: needs feature scaling, slow prediction on large data, sensitive to irrelevant features and to the choice of K, and struggles in very high dimensions.", level: "Medium" },
    { q: "How do decision trees decide where to split?", a: "They try candidate thresholds for each feature and choose the split that makes the child groups most pure, measured by Gini impurity or entropy (information gain).", level: "Medium" },
    { q: "How do you prevent a decision tree from overfitting?", a: "Limit max_depth, set min_samples_split / min_samples_leaf, prune, or use ensembles like Random Forest that average many trees.", level: "Medium" },
    { q: "What are Type I and Type II errors?", a: "Type I = false positive (raising a false alarm). Type II = false negative (missing a real positive).", level: "Easy" },
    { q: "What is the precision-recall trade-off and how do you control it?", a: "Changing the decision threshold on predicted probabilities shifts the balance: a lower threshold increases recall and decreases precision; a higher threshold does the opposite. Choose the threshold using a precision-recall curve and business costs.", level: "Hard" },
    { q: "What is ROC-AUC?", a: "The ROC curve plots true positive rate vs false positive rate over all thresholds; AUC is the area under it - the probability that the model ranks a random positive above a random negative. 0.5 = random, 1.0 = perfect. For heavy imbalance, PR-AUC is often more informative.", level: "Hard" },
    { q: "How would you handle an imbalanced dataset?", a: "Use appropriate metrics (recall, F1, PR-AUC), stratified splits, class_weight='balanced', resampling (oversampling the minority e.g. SMOTE, or undersampling the majority), threshold tuning, and collecting more minority data.", level: "Hard" }
  ],
  practice: [
    {
      task: "A cancer screening model produced TP = 45, FN = 5, FP = 30, TN = 920. Calculate accuracy, precision, recall and F1 by hand, then verify with Python.",
      hint: "Total = 1000. Precision = 45/75, Recall = 45/50.",
      solution: "Accuracy = (45+920)/1000 = 0.965; Precision = 45/75 = 0.6; Recall = 45/50 = 0.9; F1 = 2*0.6*0.9/1.5 = 0.72. Recall is the key metric here: only 5 cancers were missed; the 30 false alarms get a follow-up test."
    },
    {
      task: "In the ML Playground (/tools/ml-playground), create two overlapping clusters of points. Run KNN with K = 1, 3 and 9. Describe how the boundary changes.",
      hint: "Watch for small 'islands' of colour around single noisy points.",
      solution: "K = 1 creates a jagged boundary with islands around every noisy point (overfitting). K = 3 smooths it slightly. K = 9 gives a smooth boundary that ignores individual noise but may misclassify points near the true border (closer to underfitting)."
    },
    {
      task: "Train a DecisionTreeClassifier(max_depth=2, random_state=0) on this data and print the rules with export_text: X = [[1,60],[2,70],[3,65],[4,80],[5,90],[6,55],[7,85],[8,95]] (hours, attendance), y = [0,0,0,1,1,0,1,1].",
      hint: "from sklearn.tree import DecisionTreeClassifier, export_text; export_text(tree, feature_names=['hours','attendance']).",
      solution: `from sklearn.tree import DecisionTreeClassifier, export_text
X = [[1,60],[2,70],[3,65],[4,80],[5,90],[6,55],[7,85],[8,95]]
y = [0,0,0,1,1,0,1,1]
tree = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X, y)
print(export_text(tree, feature_names=["hours", "attendance"]))
# The rule separates perfectly using attendance (e.g. attendance <= 75 -> 0, else 1)`
    },
    {
      task: "Add StandardScaler to the fruit KNN using a Pipeline and predict the same two fruits again.",
      hint: "from sklearn.pipeline import make_pipeline; from sklearn.preprocessing import StandardScaler; model = make_pipeline(StandardScaler(), KNeighborsClassifier(3)).",
      solution: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
X = [[150, 7.0], [170, 7.5], [140, 6.8], [130, 6.0], [180, 9.2], [200, 9.8], [190, 9.0], [210, 10.1]]
y = ["apple"] * 4 + ["orange"] * 4
model = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=3)).fit(X, y)
print(model.predict([[160, 7.2], [195, 9.5]]).tolist())   # ['apple', 'orange'] - now both features count equally`
    },
    {
      task: "Write a prompt asking an AI assistant to generate 5 tricky interview questions on the confusion matrix with answers. Answer them yourself first, then compare.",
      hint: "Use the AI Prompt Lab template: role (ML interviewer), task, format (Q + model answer), constraint (include one numeric calculation).",
      solution: "Example prompt: 'Act as an ML interviewer. Ask me 5 tricky questions about confusion matrices, precision, recall and F1, including one numeric calculation. After I answer, give the model answer and score me out of 10.' Comparing your answers trains you for real interviews."
    }
  ],
  quiz: [
    {
      question: "In scikit-learn's binary confusion matrix [[TN, FP], [FN, TP]], what is the value in the bottom-left?",
      options: ["True positives", "False negatives", "False positives", "True negatives"],
      answer: 1,
      explanation: "Row = actual, column = predicted. Bottom-left = actual 1, predicted 0 = false negative."
    },
    {
      question: "TP = 8, FP = 2, FN = 8. What is the precision?",
      options: ["0.5", "0.2", "0.8", "0.44"],
      answer: 2,
      explanation: "Precision = TP / (TP + FP) = 8 / 10 = 0.8. (Recall would be 8/16 = 0.5.)"
    },
    {
      question: "For detecting a dangerous disease, which metric matters most?",
      options: ["Precision", "Accuracy", "Training time", "Recall"],
      answer: 3,
      explanation: "Missing a sick patient (false negative) is the most dangerous error, so recall is the priority."
    },
    {
      question: "Which classifier makes predictions by majority vote of the closest training points?",
      options: ["K-Nearest Neighbours", "Logistic regression", "Linear regression", "Decision tree"],
      answer: 0,
      explanation: "KNN finds the K nearest neighbours and votes."
    },
    {
      question: "Why should you scale features before using KNN?",
      options: ["KNN only accepts values between 0 and 1", "Otherwise features with large numeric ranges dominate the distance", "Scaling makes the dataset smaller", "It is required for decision trees too"],
      answer: 1,
      explanation: "Distance adds squared differences; a feature in grams (hundreds) would drown a feature in cm (single digits)."
    }
  ]
};
