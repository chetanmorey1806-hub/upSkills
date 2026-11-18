export default {
  id: "day-04-logistic-regression-classification-metrics",
  title: "Logistic Regression and Classification Metrics: Confusion Matrix, Precision, Recall, F1, ROC-AUC",
  module: "Module 2: Supervised Learning",
  day: 4,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Logistic regression is the most widely used baseline for classification. Learn how the sigmoid turns a linear score into a probability, how the model is trained with log loss, and — most importantly for interviews — how to evaluate classifiers with the confusion matrix, precision, recall, F1, ROC-AUC and threshold tuning.",
  objectives: [
    "Explain how logistic regression uses the sigmoid function and log loss",
    "Interpret coefficients as changes in log-odds",
    "Build and read a confusion matrix (TP, FP, TN, FN)",
    "Calculate precision, recall, F1-score and choose the right metric for a business problem",
    "Use ROC curves, AUC, PR-AUC and decision thresholds",
  ],
  theory: [
    {
      heading: "From Linear Score to Probability: the Sigmoid",
      content: "For classification we want a probability between 0 and 1, but a linear model `z = b0 + b1x1 + … + bnxn` can output any number. Logistic regression passes z through the **sigmoid** (logistic) function: `p = σ(z) = 1 / (1 + e^(−z))`.\n\nWhen z = 0, p = 0.5. Large positive z → p close to 1; large negative z → p close to 0. The model predicts class 1 when p ≥ 0.5 (the default **threshold**), which is the same as z ≥ 0. So the **decision boundary** is a straight line (a hyperplane) — logistic regression is a **linear classifier**.",
      syntax: `p(y=1 | x) = 1 / (1 + exp(−(b0 + b1·x1 + ... + bn·xn)))
log(p / (1 − p)) = b0 + b1·x1 + ... + bn·xn     # log-odds (logit) is linear`,
      tip: "Interpretation: a coefficient b means one unit increase in x multiplies the odds by e^b. If b = 0.7, odds roughly double (e^0.7 ≈ 2.01).",
    },
    {
      heading: "Training: Log Loss (Binary Cross-Entropy)",
      content: "We cannot use MSE with the sigmoid (the loss becomes non-convex). Instead logistic regression minimises **log loss**: `L = −(1/n) Σ [y·log(p) + (1 − y)·log(1 − p)]`.\n\nIntuition: if the true label is 1 and the model says p = 0.99, loss ≈ 0.01 (tiny). If it says p = 0.01, loss ≈ 4.6 (huge). Confident wrong answers are punished heavily. The loss is convex, so solvers like `lbfgs` reliably find the global minimum.\n\nsklearn's LogisticRegression applies **L2 regularisation by default**. `C` is the **inverse** of regularisation strength: small C = strong regularisation (simpler model), large C = weak regularisation.",
      points: [
        "penalty='l2' (default), 'l1' (needs solver='liblinear' or 'saga'), 'elasticnet' (saga)",
        "Multi-class: sklearn uses the softmax (multinomial) formulation automatically with lbfgs",
        "Increase max_iter (e.g. 1000) if you see a ConvergenceWarning, and scale features",
      ],
    },
    {
      heading: "The Confusion Matrix",
      content: "For a binary problem with positive class = 'fraud', every prediction falls in one of four boxes:\n\n**TP** (True Positive): fraud predicted as fraud. **TN** (True Negative): genuine predicted as genuine. **FP** (False Positive, Type I error): genuine flagged as fraud — false alarm. **FN** (False Negative, Type II error): fraud missed.\n\nIn sklearn, `confusion_matrix(y_true, y_pred)` returns rows = actual, columns = predicted, ordered [0, 1]. So the layout is `[[TN, FP], [FN, TP]]`.",
      syntax: `                 Predicted 0   Predicted 1
Actual 0  (neg)      TN            FP
Actual 1  (pos)      FN            TP`,
    },
    {
      heading: "Accuracy, Precision, Recall, F1",
      content: "**Accuracy** = (TP + TN) / total. Misleading for imbalanced data: if 1% of transactions are fraud, predicting 'not fraud' always gives 99% accuracy and catches nothing.\n\n**Precision** = TP / (TP + FP): of everything we flagged positive, how many were truly positive? High precision = few false alarms. Important for spam filters (do not lose real mail) and recommending products.\n\n**Recall (Sensitivity, TPR)** = TP / (TP + FN): of all actual positives, how many did we catch? Important for cancer screening, fraud detection — missing a positive is costly.\n\n**F1** = 2·P·R / (P + R): harmonic mean, high only when both are high. **Specificity** = TN / (TN + FP).",
      points: [
        "Precision-recall trade-off: lowering the threshold catches more positives (recall ↑) but raises false alarms (precision ↓)",
        "Multi-class averaging: macro (equal weight per class), weighted (by support), micro (global counts)",
        "classification_report prints precision, recall, F1 and support for every class",
      ],
    },
    {
      heading: "ROC Curve, AUC and PR Curve",
      content: "Instead of one threshold, evaluate the model across **all** thresholds. The **ROC curve** plots True Positive Rate (recall) vs False Positive Rate (FP / (FP + TN)). A random classifier is the diagonal line.\n\n**ROC-AUC** = area under that curve, from 0.5 (random) to 1.0 (perfect). Interpretation: the probability that a randomly chosen positive gets a higher score than a randomly chosen negative. It is threshold-independent and measures **ranking** quality.\n\nFor heavily imbalanced data (fraud 0.1%), ROC-AUC can look great even when precision is poor, because FPR stays small when negatives are huge. Use the **Precision-Recall curve** and **average precision (PR-AUC)** instead.",
      syntax: `from sklearn.metrics import roc_auc_score, roc_curve, average_precision_score
proba = model.predict_proba(X_test)[:, 1]   # probability of class 1
roc_auc_score(y_test, proba)
average_precision_score(y_test, proba)`,
      tip: "Always pass probabilities (predict_proba or decision_function), not hard 0/1 predictions, to roc_auc_score.",
    },
    {
      heading: "Choosing the Threshold",
      content: "The default 0.5 threshold is rarely optimal for business. A bank might accept more false alarms to catch 95% of fraud; an email provider prefers few false positives. Get probabilities with `predict_proba`, then choose a threshold that meets a business requirement (e.g. recall ≥ 0.95) or maximises F1 or expected profit, using a **validation** set — never the test set.\n\nsklearn 1.5 added `TunedThresholdClassifierCV`, which tunes the threshold with cross-validation automatically.",
    },
  ],
  examples: [
    {
      title: "Sigmoid and Log Loss by Hand",
      scenario: "Build intuition for how linear scores become probabilities and how log loss punishes confident mistakes.",
      steps: [
        "Implement the sigmoid with NumPy",
        "Apply it to scores from −4 to 4",
        "Compute the log loss for a good and a bad prediction",
      ],
      code: `import numpy as np
from sklearn.metrics import log_loss

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

for z in [-4, -2, 0, 2, 4]:
    print(f"z={z:+d} -> p={sigmoid(z):.3f}")

y_true = [1, 1, 0, 0]
good = [0.9, 0.8, 0.2, 0.1]
bad = [0.1, 0.3, 0.8, 0.9]
print("Log loss good model:", round(log_loss(y_true, good), 3))
print("Log loss bad model :", round(log_loss(y_true, bad), 3))
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.metrics import log_loss

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

for z in [-4, -2, 0, 2, 4]:
    print(f"z={z:+d} -> p={sigmoid(z):.3f}")

y_true = [1, 1, 0, 0]
good = [0.9, 0.8, 0.2, 0.1]
bad = [0.1, 0.3, 0.8, 0.9]
print("Log loss good model:", round(log_loss(y_true, good), 3))
print("Log loss bad model :", round(log_loss(y_true, bad), 3))
` } },
      result: "z=-4 -> p=0.018\nz=-2 -> p=0.119\nz=+0 -> p=0.500\nz=+2 -> p=0.881\nz=+4 -> p=0.982\nLog loss good model: 0.164\nLog loss bad model : 1.855",
      explanation: "A score of 0 maps to exactly 0.5, and the sigmoid saturates near 0 or 1 for large |z|. The good model's probabilities agree with the labels, so its log loss is small; the bad model is confidently wrong and is penalised heavily.",
    },
    {
      title: "Logistic Regression on Breast Cancer with Confusion Matrix",
      scenario: "A hospital wants to classify tumours as malignant or benign. In this dataset target 0 = malignant, 1 = benign.",
      steps: [
        "Split with stratification, scale features in a pipeline",
        "Fit LogisticRegression and predict",
        "Print the confusion matrix and classification report",
      ],
      code: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, classification_report

data = load_breast_cancer()
X, y = data.data, data.target
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

clf = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
clf.fit(X_tr, y_tr)
y_pred = clf.predict(X_te)

print(confusion_matrix(y_te, y_pred))
print(classification_report(y_te, y_pred, target_names=data.target_names, digits=3))
`,
      python: { files: { "main.py": `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, classification_report

data = load_breast_cancer()
X, y = data.data, data.target
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

clf = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
clf.fit(X_tr, y_tr)
y_pred = clf.predict(X_te)

print(confusion_matrix(y_te, y_pred))
print(classification_report(y_te, y_pred, target_names=data.target_names, digits=3))
` } },
      result: "[[52  1]\n [ 1 89]]\n              precision    recall  f1-score   support\n\n   malignant      0.981     0.981     0.981        53\n      benign      0.989     0.989     0.989        90\n\n    accuracy                          0.986       143\n   macro avg      0.985     0.985     0.985       143\nweighted avg      0.986     0.986     0.986       143",
      explanation: "Rows are actual (malignant, benign) and columns are predicted. The off-diagonal cells are the mistakes. The report shows precision, recall and F1 for each class; 'support' is the number of true samples of that class. For cancer screening we care most about recall of the malignant class — how many cancers we catch.",
    },
    {
      title: "Precision, Recall and F1 Manually",
      scenario: "A fraud model flagged transactions. Compute each metric from the confusion matrix and confirm with sklearn.",
      steps: [
        "Define y_true and y_pred (1 = fraud)",
        "Extract TN, FP, FN, TP using ravel()",
        "Compute metrics by formula and compare with sklearn",
      ],
      code: `from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, accuracy_score

y_true = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]
y_pred = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0]

tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
print("TN, FP, FN, TP =", tn, fp, fn, tp)

precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)
print(f"Manual : acc={(tp + tn) / len(y_true):.3f} P={precision:.3f} R={recall:.3f} F1={f1:.3f}")
print(f"sklearn: acc={accuracy_score(y_true, y_pred):.3f} "
      f"P={precision_score(y_true, y_pred):.3f} "
      f"R={recall_score(y_true, y_pred):.3f} F1={f1_score(y_true, y_pred):.3f}")
`,
      python: { files: { "main.py": `from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, accuracy_score

y_true = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]
y_pred = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0]

tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
print("TN, FP, FN, TP =", tn, fp, fn, tp)

precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)
print(f"Manual : acc={(tp + tn) / len(y_true):.3f} P={precision:.3f} R={recall:.3f} F1={f1:.3f}")
print(f"sklearn: acc={accuracy_score(y_true, y_pred):.3f} "
      f"P={precision_score(y_true, y_pred):.3f} "
      f"R={recall_score(y_true, y_pred):.3f} F1={f1_score(y_true, y_pred):.3f}")
` } },
      result: "TN, FP, FN, TP = 5 2 2 3\nManual : acc=0.667 P=0.600 R=0.600 F1=0.600\nsklearn: acc=0.667 P=0.600 R=0.600 F1=0.600",
      explanation: "3 of 5 flagged transactions were actually fraud (precision 0.6) and 3 of 5 actual frauds were caught (recall 0.6). Two false alarms and two missed frauds. ravel() flattens [[TN, FP], [FN, TP]] in that exact order — a handy interview trick.",
    },
    {
      title: "ROC-AUC, PR-AUC and Threshold Tuning",
      scenario: "On an imbalanced dataset (10% positives), see how changing the threshold trades precision for recall.",
      steps: [
        "Generate imbalanced data with make_classification(weights=[0.9, 0.1])",
        "Fit logistic regression and get predict_proba",
        "Compute ROC-AUC and average precision",
        "Print precision and recall at thresholds 0.5, 0.3 and 0.1",
      ],
      code: `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, average_precision_score, precision_score, recall_score

X, y = make_classification(n_samples=3000, n_features=10, n_informative=4,
                           weights=[0.9, 0.1], flip_y=0.02, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

model = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
proba = model.predict_proba(X_te)[:, 1]
print("Positive rate:", round(y_te.mean(), 3))
print("ROC-AUC:", round(roc_auc_score(y_te, proba), 3))
print("PR-AUC (avg precision):", round(average_precision_score(y_te, proba), 3))

for t in [0.5, 0.3, 0.1]:
    pred = (proba >= t).astype(int)
    print(f"threshold={t}: precision={precision_score(y_te, pred):.3f} "
          f"recall={recall_score(y_te, pred):.3f} flagged={pred.sum()}")
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, average_precision_score, precision_score, recall_score

X, y = make_classification(n_samples=3000, n_features=10, n_informative=4,
                           weights=[0.9, 0.1], flip_y=0.02, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

model = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
proba = model.predict_proba(X_te)[:, 1]
print("Positive rate:", round(y_te.mean(), 3))
print("ROC-AUC:", round(roc_auc_score(y_te, proba), 3))
print("PR-AUC (avg precision):", round(average_precision_score(y_te, proba), 3))

for t in [0.5, 0.3, 0.1]:
    pred = (proba >= t).astype(int)
    print(f"threshold={t}: precision={precision_score(y_te, pred):.3f} "
          f"recall={recall_score(y_te, pred):.3f} flagged={pred.sum()}")
` } },
      result: "Positive rate: 0.107\nROC-AUC: 0.718\nPR-AUC (avg precision): 0.426\nthreshold=0.5: precision=0.938 recall=0.156 flagged=16\nthreshold=0.3: precision=0.686 recall=0.250 flagged=35\nthreshold=0.1: precision=0.188 recall=0.646 flagged=330",
      explanation: "ROC-AUC (~0.72) looks respectable, but PR-AUC (~0.43) is much lower — a reminder that the positive class is rare and that ROC-AUC alone flatters the model. Lowering the threshold from 0.5 to 0.1 flags many more rows: recall rises while precision falls. The right threshold depends on the cost of missing a positive versus investigating a false alarm.",
    },
    {
      title: "Interpreting Coefficients as Odds Ratios",
      scenario: "A telecom churn model: which factors increase the odds of a customer leaving?",
      steps: [
        "Create a small synthetic churn dataset",
        "Fit logistic regression on standardised features",
        "Convert coefficients to odds ratios with np.exp",
      ],
      code: `import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

rng = np.random.default_rng(7)
n = 1000
df = pd.DataFrame({
    "monthly_bill": rng.normal(500, 150, n),
    "complaints": rng.poisson(1.0, n),
    "tenure_months": rng.integers(1, 72, n),
})
z = 0.004 * (df.monthly_bill - 500) + 0.8 * df.complaints - 0.05 * df.tenure_months
df["churn"] = (rng.random(n) < 1 / (1 + np.exp(-z))).astype(int)

X = StandardScaler().fit_transform(df.drop(columns="churn"))
model = LogisticRegression().fit(X, df.churn)
result = pd.DataFrame({"coef": model.coef_[0], "odds_ratio": np.exp(model.coef_[0])},
                      index=df.columns[:-1]).round(3)
print(result)
`,
      python: { files: { "main.py": `import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

rng = np.random.default_rng(7)
n = 1000
df = pd.DataFrame({
    "monthly_bill": rng.normal(500, 150, n),
    "complaints": rng.poisson(1.0, n),
    "tenure_months": rng.integers(1, 72, n),
})
z = 0.004 * (df.monthly_bill - 500) + 0.8 * df.complaints - 0.05 * df.tenure_months
df["churn"] = (rng.random(n) < 1 / (1 + np.exp(-z))).astype(int)

X = StandardScaler().fit_transform(df.drop(columns="churn"))
model = LogisticRegression().fit(X, df.churn)
result = pd.DataFrame({"coef": model.coef_[0], "odds_ratio": np.exp(model.coef_[0])},
                      index=df.columns[:-1]).round(3)
print(result)
` } },
      result: "                coef  odds_ratio\nmonthly_bill   0.656       1.927\ncomplaints     0.740       2.095\ntenure_months -0.975       0.377",
      explanation: "Because features are standardised, an odds ratio is the multiplicative change in churn odds for a one-standard-deviation increase. Complaints and a higher bill increase churn odds (ratio > 1); longer tenure strongly decreases them (ratio < 1). This explainability is why banks and telecoms still love logistic regression.",
    },
  ],
  interview: [
    { q: "Why is it called logistic 'regression' if it is used for classification?", a: "Because it regresses the log-odds of the positive class as a linear function of the features: log(p/(1−p)) = b0 + Σbᵢxᵢ. The output is a continuous probability, which is converted to a class by applying a threshold. So it is a regression on log-odds used for classification.", level: "Easy" },
    { q: "Why don't we use MSE as the loss for logistic regression?", a: "With the sigmoid, MSE produces a non-convex loss surface with flat regions and local minima, and gradients become tiny when predictions are confidently wrong. Log loss (cross-entropy) is convex for logistic regression, corresponds to maximum likelihood estimation under a Bernoulli model, and strongly penalises confident wrong predictions.", level: "Medium" },
    { q: "Explain precision and recall with a real example.", a: "In a cancer test: recall = of all patients who actually have cancer, what fraction did we detect? Precision = of all patients we said have cancer, what fraction really do? A screening test should have high recall (do not miss cancers), accepting lower precision since follow-up tests can clear false alarms. A spam filter needs high precision (do not send real emails to spam).", level: "Easy" },
    { q: "Why is accuracy a bad metric for imbalanced datasets?", a: "If 99% of samples are negative, a model that always predicts negative achieves 99% accuracy while detecting zero positives. Accuracy hides poor performance on the minority class. Use precision, recall, F1, PR-AUC, balanced accuracy or Matthews correlation coefficient instead.", level: "Easy" },
    { q: "What is the F1 score and why harmonic mean instead of arithmetic mean?", a: "F1 = 2PR/(P+R). The harmonic mean is dominated by the smaller value, so F1 is high only when both precision and recall are high. With P = 1.0 and R = 0.0, the arithmetic mean would be 0.5, but F1 is 0, correctly signalling a useless model. Fβ generalises it, weighting recall β times as important as precision.", level: "Medium" },
    { q: "What does ROC-AUC represent?", a: "AUC is the area under the ROC curve (TPR vs FPR across thresholds). It equals the probability that a randomly chosen positive example receives a higher predicted score than a randomly chosen negative example. 0.5 = random ranking, 1.0 = perfect ranking. It is threshold-independent and insensitive to class balance in its definition.", level: "Medium" },
    { q: "When would you prefer PR-AUC over ROC-AUC?", a: "For highly imbalanced problems where the positive class is rare and what matters is performance on positives — fraud, rare disease, defect detection. ROC-AUC uses FPR, which stays small when there are many negatives, so it can look excellent even with many false positives. PR-AUC focuses on precision and recall of the positive class and exposes that weakness.", level: "Hard" },
    { q: "What is a Type I and Type II error?", a: "Type I error = false positive (rejecting a true null hypothesis), e.g. flagging a genuine transaction as fraud. Type II error = false negative, e.g. missing an actual fraud. Which is worse depends on the business cost.", level: "Easy" },
    { q: "What is the role of C in sklearn's LogisticRegression?", a: "C is the inverse of regularisation strength (C = 1/λ). Smaller C means stronger regularisation, smaller coefficients and a simpler model that may underfit; larger C means weaker regularisation that may overfit. The default is C=1.0 with an L2 penalty. Tune it with cross-validation.", level: "Medium" },
    { q: "How does logistic regression handle multi-class problems?", a: "Two strategies: One-vs-Rest (train one binary classifier per class and pick the highest score) and multinomial (softmax) regression, which models all classes jointly so probabilities sum to 1 and minimises cross-entropy. In recent sklearn, the lbfgs solver uses multinomial by default for multi-class targets.", level: "Medium" },
    { q: "Your model has 95% accuracy but the business says it is useless. What could be wrong?", a: "Likely class imbalance — the model may predict the majority class most of the time. Check the confusion matrix, recall of the minority class, and PR-AUC. Other causes: wrong threshold, metric not aligned with business cost, data leakage that does not hold in production, or the test set not representative of real traffic (distribution shift).", level: "Hard" },
    { q: "How would you choose a classification threshold in production?", a: "Use predicted probabilities on a validation set, compute precision/recall (or cost/profit) for many thresholds, and select the threshold that satisfies the business constraint — e.g. recall ≥ 90% with maximum precision — or maximises expected profit. Also check calibration (CalibratedClassifierCV) if probabilities are used directly, and monitor the threshold over time as data drifts.", level: "Hard" },
  ],
  practice: [
    {
      task: "A model on 1000 loan applications gives TP = 80, FP = 20, FN = 40, TN = 860. Compute accuracy, precision, recall, specificity and F1 by hand.",
      hint: "Precision uses the predicted-positive column; recall uses the actual-positive row.",
      solution: "Accuracy = (80 + 860) / 1000 = 0.94\nPrecision = 80 / (80 + 20) = 0.80\nRecall = 80 / (80 + 40) = 0.667\nSpecificity = 860 / (860 + 20) = 0.977\nF1 = 2 × 0.8 × 0.667 / (0.8 + 0.667) = 0.727",
    },
    {
      task: "Train LogisticRegression on load_iris (multi-class). Print the classification report and the macro and weighted F1 scores.",
      hint: "f1_score(y_true, y_pred, average='macro').",
      solution: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, f1_score

X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
pred = LogisticRegression(max_iter=1000).fit(X_tr, y_tr).predict(X_te)
print(classification_report(y_te, pred))
print("macro F1:", f1_score(y_te, pred, average="macro"))
print("weighted F1:", f1_score(y_te, pred, average="weighted"))
# Classes are balanced, so macro and weighted F1 are almost equal (~0.93).`,
    },
    {
      task: "Using the breast-cancer pipeline from Example 2, find the smallest threshold on predicted probability of MALIGNANT (class 0) that gives at least 0.98 recall for malignant on the test set. Print precision at that threshold.",
      hint: "proba_malignant = clf.predict_proba(X_te)[:, 0]; loop thresholds from 0.9 down to 0.05. (In a real project use a validation set.)",
      solution: `import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, recall_score

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
clf = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X_tr, y_tr)
p_mal = clf.predict_proba(X_te)[:, 0]
y_mal = (y_te == 0).astype(int)
for t in np.arange(0.9, 0.04, -0.05):
    pred = (p_mal >= t).astype(int)
    if recall_score(y_mal, pred) >= 0.98:
        print(f"threshold={t:.2f} recall={recall_score(y_mal, pred):.3f} "
              f"precision={precision_score(y_mal, pred):.3f}")
        break`,
    },
    {
      task: "Compare ROC-AUC and average precision for LogisticRegression on make_classification with weights=[0.99, 0.01] (n_samples=20000, random_state=0). What do you observe?",
      hint: "Same code as Example 4, just a more extreme imbalance.",
      solution: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, average_precision_score

X, y = make_classification(n_samples=20000, n_features=10, n_informative=4,
                           weights=[0.99, 0.01], random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
p = LogisticRegression(max_iter=1000).fit(X_tr, y_tr).predict_proba(X_te)[:, 1]
print("ROC-AUC:", round(roc_auc_score(y_te, p), 3))
print("PR-AUC :", round(average_precision_score(y_te, p), 3))
# ROC-AUC ~0.68 sounds 'okay', but PR-AUC is only ~0.14: with 1% positives, most rows
# the model flags are false positives. ROC-AUC hides this; PR-AUC is the honest metric.`,
    },
  ],
  quiz: [
    { question: "In sklearn's confusion_matrix for binary labels [0, 1], the element at [0, 1] is:", options: ["TP", "FN", "FP", "TN"], answer: 2, explanation: "Rows = actual, columns = predicted. Row 0 (actual negative), column 1 (predicted positive) = false positive." },
    { question: "A cancer screening model should prioritise:", options: ["Precision", "Recall", "Accuracy", "Specificity"], answer: 1, explanation: "Missing a cancer (false negative) is very costly, so high recall is the priority." },
    { question: "sigmoid(0) equals:", options: ["0", "0.5", "1", "Infinity"], answer: 1, explanation: "1 / (1 + e^0) = 1/2." },
    { question: "In LogisticRegression, decreasing C:", options: ["Weakens regularisation", "Strengthens regularisation", "Changes the solver", "Increases the threshold"], answer: 1, explanation: "C is the inverse of regularisation strength, so a smaller C means stronger regularisation." },
    { question: "An ROC-AUC of 0.5 means the model:", options: ["Is perfect", "Ranks no better than random", "Always predicts positive", "Has 50% precision"], answer: 1, explanation: "0.5 AUC corresponds to the diagonal line of a random classifier." },
    { question: "Lowering the decision threshold from 0.5 to 0.2 usually:", options: ["Raises precision and lowers recall", "Raises recall and lowers precision", "Changes nothing", "Raises both"], answer: 1, explanation: "More samples are predicted positive, catching more true positives but also more false positives." },
  ],
};
