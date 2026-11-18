export default {
  id: "day-06-decision-trees-random-forests",
  title: "Decision Trees and Random Forests (Gini, Entropy, Bagging, Feature Importance)",
  module: "Module 2: Supervised Learning",
  day: 6,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Decision trees learn a flowchart of if-else questions from data, and random forests combine hundreds of such trees to get one of the most reliable models for tabular data. Learn how trees choose splits (Gini, entropy, variance), how to control overfitting, how bagging works, and how to read feature importance correctly.",
  objectives: [
    "Explain how a decision tree chooses splits using Gini impurity, entropy and information gain",
    "Control tree complexity with max_depth, min_samples_leaf and cost-complexity pruning",
    "Explain bagging, bootstrap samples, feature randomness and out-of-bag (OOB) score",
    "Train RandomForestClassifier / RandomForestRegressor and tune key hyperparameters",
    "Compute and interpret impurity-based and permutation feature importance",
  ],
  theory: [
    {
      heading: "How a Decision Tree Thinks",
      content: "A decision tree asks a sequence of yes/no questions: 'Is petal length ≤ 2.45 cm?' → if yes, setosa; if no, ask another question. The top node is the **root**, internal nodes hold **conditions**, and **leaves** hold predictions (majority class for classification, mean value for regression).\n\nThe tree is built greedily, top-down (the **CART** algorithm used by sklearn): at each node it tries every feature and every threshold, and picks the split that makes the child nodes **purest**. It then repeats recursively on each child until a stopping rule is met. Every split is binary in sklearn.",
      points: [
        "Very interpretable — you can print the rules (export_text) and explain them to a manager",
        "No scaling needed; handles non-linear relationships and interactions automatically",
        "Weakness: a single deep tree overfits badly and is unstable (small data change → different tree)",
      ],
    },
    {
      heading: "Measuring Impurity: Gini, Entropy, Variance",
      content: "**Gini impurity** = 1 − Σ pₖ², where pₖ is the fraction of class k in the node. A pure node (all one class) has Gini 0; a 50/50 binary node has Gini 0.5.\n\n**Entropy** = −Σ pₖ log₂ pₖ. Pure node = 0; 50/50 = 1 bit. **Information gain** = entropy(parent) − weighted average entropy(children). The split with the highest gain (or largest Gini decrease) wins.\n\nGini and entropy usually give very similar trees; Gini is slightly faster (no logarithm) and is sklearn's default. For **regression trees**, impurity is the **variance / MSE** of the target in the node (criterion='squared_error').",
      syntax: `Node with 8 'yes' and 2 'no':
Gini    = 1 − (0.8² + 0.2²) = 0.32
Entropy = −(0.8·log2 0.8 + 0.2·log2 0.2) ≈ 0.722`,
    },
    {
      heading: "Controlling Overfitting in Trees",
      content: "Left alone, a tree keeps splitting until each leaf is pure — memorising the training data (100% train accuracy, poor test accuracy). **Pre-pruning** stops growth early using hyperparameters; **post-pruning** grows a full tree and then cuts back weak branches.",
      points: [
        "max_depth: maximum number of levels (e.g. 3-10)",
        "min_samples_split: a node needs at least this many samples to be split",
        "min_samples_leaf: every leaf must keep at least this many samples (smooths predictions)",
        "max_leaf_nodes, max_features: limit size and features considered per split",
        "ccp_alpha: cost-complexity (post-)pruning — larger alpha removes more branches",
        "class_weight='balanced' for imbalanced classes",
      ],
      tip: "Trees cannot extrapolate: a regression tree never predicts a value outside the range of training targets.",
    },
    {
      heading: "Ensembles and Bagging",
      content: "An **ensemble** combines many models so their errors cancel out. **Bagging** (Bootstrap AGGregatING): create many **bootstrap samples** (random samples of the training data drawn **with replacement**, same size as the original), train one model on each, and average their predictions (regression) or take a majority vote (classification).\n\nEach bootstrap sample contains about **63.2%** unique rows; the remaining ~36.8% are **out-of-bag (OOB)** for that tree and can be used as a free validation set (`oob_score=True`). Bagging mainly **reduces variance**, which is exactly what high-variance deep trees need.",
    },
    {
      heading: "Random Forest",
      content: "A random forest = bagging of decision trees **plus feature randomness**: at each split, a tree only considers a random subset of features (`max_features`, default √n_features for classification, all features (1.0) for regression in sklearn). This **decorrelates** the trees — otherwise every tree would split on the same strong feature first and they would make the same mistakes.\n\nRandom forests are robust, need little tuning, handle hundreds of features, give feature importance and are hard to overfit badly by adding more trees. Downsides: larger and slower than a single tree, less interpretable, and they still cannot extrapolate.",
      syntax: `from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(n_estimators=300, max_depth=None, max_features="sqrt",
                            min_samples_leaf=1, oob_score=True, n_jobs=-1, random_state=42)`,
      tip: "More trees never hurts accuracy (it just plateaus) — it only costs time. Tune max_features, max_depth / min_samples_leaf instead.",
    },
    {
      heading: "Feature Importance: Two Kinds",
      content: "**Impurity-based importance** (`feature_importances_`): total impurity decrease contributed by each feature, averaged over trees, normalised to sum to 1. Fast, but **biased towards high-cardinality / continuous features** (an ID column can look important) and computed on training data.\n\n**Permutation importance** (`sklearn.inspection.permutation_importance`): shuffle one feature's values on a validation set and measure how much the score drops. Model-agnostic and more reliable, but slower; correlated features share (and may hide) importance.\n\nFor individual predictions, SHAP values are the industry standard explanation tool.",
    },
  ],
  examples: [
    {
      title: "Gini and Entropy by Hand",
      scenario: "Evaluate two candidate splits of a loan dataset (10 approved, 10 rejected) to see which one a tree would choose.",
      steps: [
        "Write gini() and entropy() functions",
        "Compute impurity of the parent node",
        "Compute weighted impurity of two candidate splits and the gain",
      ],
      code: `import numpy as np

def gini(counts):
    p = np.array(counts) / sum(counts)
    return 1 - np.sum(p ** 2)

def entropy(counts):
    p = np.array(counts) / sum(counts)
    p = p[p > 0]
    return -np.sum(p * np.log2(p))

def weighted(fn, children):
    n = sum(sum(c) for c in children)
    return sum(sum(c) / n * fn(c) for c in children)

parent = [10, 10]                       # [approved, rejected]
split_a = [[8, 2], [2, 8]]              # split on income > 50k
split_b = [[6, 5], [4, 5]]              # split on city

print("Parent  gini=%.3f entropy=%.3f" % (gini(parent), entropy(parent)))
for name, s in [("A income", split_a), ("B city", split_b)]:
    g, e = weighted(gini, s), weighted(entropy, s)
    print(f"Split {name}: gini={g:.3f} (gain {gini(parent) - g:.3f}) "
          f"entropy={e:.3f} (info gain {entropy(parent) - e:.3f})")
`,
      python: { files: { "main.py": `import numpy as np

def gini(counts):
    p = np.array(counts) / sum(counts)
    return 1 - np.sum(p ** 2)

def entropy(counts):
    p = np.array(counts) / sum(counts)
    p = p[p > 0]
    return -np.sum(p * np.log2(p))

def weighted(fn, children):
    n = sum(sum(c) for c in children)
    return sum(sum(c) / n * fn(c) for c in children)

parent = [10, 10]                       # [approved, rejected]
split_a = [[8, 2], [2, 8]]              # split on income > 50k
split_b = [[6, 5], [4, 5]]              # split on city

print("Parent  gini=%.3f entropy=%.3f" % (gini(parent), entropy(parent)))
for name, s in [("A income", split_a), ("B city", split_b)]:
    g, e = weighted(gini, s), weighted(entropy, s)
    print(f"Split {name}: gini={g:.3f} (gain {gini(parent) - g:.3f}) "
          f"entropy={e:.3f} (info gain {entropy(parent) - e:.3f})")
` } },
      result: "Parent  gini=0.500 entropy=1.000\nSplit A income: gini=0.320 (gain 0.180) entropy=0.722 (info gain 0.278)\nSplit B city: gini=0.495 (gain 0.005) entropy=0.993 (info gain 0.007)",
      explanation: "The parent node is a perfect 50/50 mix: Gini 0.5 and entropy 1 bit. Split A (income) produces much purer children, so it has a large impurity decrease; split B (city) barely helps. The tree picks the split with the largest gain — here, income.",
    },
    {
      title: "Decision Tree: Overfitting and Readable Rules",
      scenario: "Train an unrestricted tree and a depth-3 tree on breast cancer data; compare train/test accuracy and print the rules of the small tree.",
      steps: [
        "Split the data",
        "Fit DecisionTreeClassifier with no limits and with max_depth=3",
        "Compare scores, then print the shallow tree with export_text",
      ],
      code: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text

data = load_breast_cancer()
X_tr, X_te, y_tr, y_te = train_test_split(data.data, data.target, test_size=0.25,
                                          random_state=42, stratify=data.target)

for depth in [None, 3]:
    t = DecisionTreeClassifier(max_depth=depth, random_state=42).fit(X_tr, y_tr)
    print(f"max_depth={depth}: leaves={t.get_n_leaves()} depth={t.get_depth()} "
          f"train={t.score(X_tr, y_tr):.3f} test={t.score(X_te, y_te):.3f}")

small = DecisionTreeClassifier(max_depth=2, random_state=42).fit(X_tr, y_tr)
print(export_text(small, feature_names=list(data.feature_names)))
`,
      python: { files: { "main.py": `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text

data = load_breast_cancer()
X_tr, X_te, y_tr, y_te = train_test_split(data.data, data.target, test_size=0.25,
                                          random_state=42, stratify=data.target)

for depth in [None, 3]:
    t = DecisionTreeClassifier(max_depth=depth, random_state=42).fit(X_tr, y_tr)
    print(f"max_depth={depth}: leaves={t.get_n_leaves()} depth={t.get_depth()} "
          f"train={t.score(X_tr, y_tr):.3f} test={t.score(X_te, y_te):.3f}")

small = DecisionTreeClassifier(max_depth=2, random_state=42).fit(X_tr, y_tr)
print(export_text(small, feature_names=list(data.feature_names)))
` } },
      result: "max_depth=None: leaves=18 depth=7 train=1.000 test=0.923\nmax_depth=3: leaves=7 depth=3 train=0.977 test=0.944\n|--- worst radius <= 16.80\n|   |--- worst concave points <= 0.14\n|   |   |--- class: 1\n|   |--- worst concave points >  0.14\n|   |   |--- class: 0\n|--- worst radius >  16.80\n|   |--- texture error <= 0.47\n|   |   |--- class: 1\n|   |--- texture error >  0.47\n|   |   |--- class: 0",
      explanation: "The unrestricted tree is 100% accurate on training data — it memorised it — but does worse on test data than you would hope. Limiting depth gives a simpler tree that generalises comparably or better. export_text prints human-readable if-else rules (class 0 = malignant, 1 = benign), which is why trees are loved in regulated industries.",
    },
    {
      title: "Random Forest vs Single Tree, with OOB Score",
      scenario: "Show how bagging many decorrelated trees improves accuracy and how the OOB score estimates test performance without a separate validation set.",
      steps: [
        "Generate a noisy classification dataset",
        "Train a single tree and random forests with 10 and 300 trees",
        "Print test accuracy and the OOB score of the large forest",
      ],
      code: `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

X, y = make_classification(n_samples=2000, n_features=20, n_informative=8,
                           flip_y=0.05, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)

tree = DecisionTreeClassifier(random_state=42).fit(X_tr, y_tr)
print("Single tree test acc:", round(tree.score(X_te, y_te), 3))

for n in [10, 300]:
    rf = RandomForestClassifier(n_estimators=n, oob_score=True, n_jobs=-1,
                                random_state=42).fit(X_tr, y_tr)
    print(f"RF {n:3d} trees: test acc={rf.score(X_te, y_te):.3f} OOB={rf.oob_score_:.3f}")
`,
      python: { files: { "main.py": `from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

X, y = make_classification(n_samples=2000, n_features=20, n_informative=8,
                           flip_y=0.05, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)

tree = DecisionTreeClassifier(random_state=42).fit(X_tr, y_tr)
print("Single tree test acc:", round(tree.score(X_te, y_te), 3))

for n in [10, 300]:
    rf = RandomForestClassifier(n_estimators=n, oob_score=True, n_jobs=-1,
                                random_state=42).fit(X_tr, y_tr)
    print(f"RF {n:3d} trees: test acc={rf.score(X_te, y_te):.3f} OOB={rf.oob_score_:.3f}")
` } },
      result: "Single tree test acc: 0.734\nRF  10 trees: test acc=0.768 OOB=0.731\nRF 300 trees: test acc=0.850 OOB=0.840",
      explanation: "A single deep tree has high variance. Averaging many trees trained on bootstrap samples with random feature subsets cancels much of that variance, so accuracy rises sharply. The OOB score (each row evaluated only by trees that did not see it) closely tracks the test accuracy.",
    },
    {
      title: "Impurity vs Permutation Feature Importance",
      scenario: "Add a meaningless random 'customer_id' column to the breast cancer data and see which importance method is fooled by it.",
      steps: [
        "Add a random high-cardinality noise column",
        "Fit a random forest",
        "Compare feature_importances_ with permutation_importance on the test set",
      ],
      code: `import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance

data = load_breast_cancer(as_frame=True)
X = data.data.copy()
X["random_id"] = np.random.default_rng(0).permutation(len(X))   # pure noise
X_tr, X_te, y_tr, y_te = train_test_split(X, data.target, test_size=0.3,
                                          random_state=42, stratify=data.target)

rf = RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1).fit(X_tr, y_tr)
imp = pd.Series(rf.feature_importances_, index=X.columns).sort_values(ascending=False)
print("Impurity top 5:\\n", imp.head(5).round(3).to_string())
print("random_id impurity rank:", list(imp.index).index("random_id") + 1, "of", len(imp))

perm = permutation_importance(rf, X_te, y_te, n_repeats=10, random_state=42, n_jobs=-1)
pimp = pd.Series(perm.importances_mean, index=X.columns).sort_values(ascending=False)
print("Permutation top 5:\\n", pimp.head(5).round(4).to_string())
print("random_id permutation importance:", round(pimp["random_id"], 4))
`,
      python: { files: { "main.py": `import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance

data = load_breast_cancer(as_frame=True)
X = data.data.copy()
X["random_id"] = np.random.default_rng(0).permutation(len(X))   # pure noise
X_tr, X_te, y_tr, y_te = train_test_split(X, data.target, test_size=0.3,
                                          random_state=42, stratify=data.target)

rf = RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1).fit(X_tr, y_tr)
imp = pd.Series(rf.feature_importances_, index=X.columns).sort_values(ascending=False)
print("Impurity top 5:\\n", imp.head(5).round(3).to_string())
print("random_id impurity rank:", list(imp.index).index("random_id") + 1, "of", len(imp))

perm = permutation_importance(rf, X_te, y_te, n_repeats=10, random_state=42, n_jobs=-1)
pimp = pd.Series(perm.importances_mean, index=X.columns).sort_values(ascending=False)
print("Permutation top 5:\\n", pimp.head(5).round(4).to_string())
print("random_id permutation importance:", round(pimp["random_id"], 4))
` } },
      result: "Impurity top 5:\n worst concave points    0.150\nworst perimeter         0.133\nworst radius            0.128\nmean concave points     0.083\nworst area              0.082\nrandom_id impurity rank: 30 of 31\nPermutation top 5:\n worst texture      0.0140\ntexture error      0.0088\nmean texture       0.0088\nperimeter error    0.0053\narea error         0.0047\nrandom_id permutation importance: 0.0",
      explanation: "Here impurity importance ranks random_id near the bottom, but it still receives a non-zero share of credit simply because the trees used its many unique values for some splits — on smaller or noisier data this bias can push such a column much higher. Permutation importance on held-out data shows that shuffling random_id does not change the score at all (exactly 0), correctly revealing it as useless. Note that correlated features (many 'worst …' and 'mean …' features overlap) share importance, so individual permutation scores can look small.",
    },
    {
      title: "Random Forest Regression on Diabetes",
      scenario: "Compare a random forest regressor with linear regression on the diabetes dataset and tune min_samples_leaf.",
      steps: [
        "Split the data",
        "Fit LinearRegression and RandomForestRegressor with different min_samples_leaf",
        "Compare test R²",
      ],
      code: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor

X, y = load_diabetes(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)

print("Linear R2:", round(LinearRegression().fit(X_tr, y_tr).score(X_te, y_te), 3))
for leaf in [1, 5, 20]:
    rf = RandomForestRegressor(n_estimators=300, min_samples_leaf=leaf,
                               random_state=42, n_jobs=-1).fit(X_tr, y_tr)
    print(f"RF min_samples_leaf={leaf:2d}: train R2={rf.score(X_tr, y_tr):.3f} "
          f"test R2={rf.score(X_te, y_te):.3f}")
`,
      python: { files: { "main.py": `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor

X, y = load_diabetes(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)

print("Linear R2:", round(LinearRegression().fit(X_tr, y_tr).score(X_te, y_te), 3))
for leaf in [1, 5, 20]:
    rf = RandomForestRegressor(n_estimators=300, min_samples_leaf=leaf,
                               random_state=42, n_jobs=-1).fit(X_tr, y_tr)
    print(f"RF min_samples_leaf={leaf:2d}: train R2={rf.score(X_tr, y_tr):.3f} "
          f"test R2={rf.score(X_te, y_te):.3f}")
` } },
      result: "Linear R2: 0.453\nRF min_samples_leaf= 1: train R2=0.924 test R2=0.434\nRF min_samples_leaf= 5: train R2=0.766 test R2=0.459\nRF min_samples_leaf=20: train R2=0.561 test R2=0.480",
      explanation: "With min_samples_leaf=1 the forest fits training data very closely (train R² ≈ 0.92) — a big train/test gap. Larger leaves smooth predictions and narrow the gap. On this small, mostly linear dataset, linear regression is competitive: tree ensembles are not automatically better, which is why you always compare with a simple baseline.",
    },
  ],
  interview: [
    { q: "How does a decision tree decide where to split?", a: "At each node it evaluates every feature and candidate threshold, computes the impurity of the resulting child nodes (Gini or entropy for classification, MSE for regression), and chooses the split giving the largest weighted impurity decrease (information gain). It repeats greedily and recursively until a stopping criterion such as max_depth or min_samples_leaf is reached.", level: "Easy" },
    { q: "What is the difference between Gini impurity and entropy?", a: "Both measure node impurity. Gini = 1 − Σp², ranging 0 to 0.5 for binary; entropy = −Σp log₂p, ranging 0 to 1 for binary. They rank splits almost identically in practice. Gini is slightly faster since it avoids logarithms and is sklearn's default; entropy comes from information theory and is used in ID3/C4.5.", level: "Medium" },
    { q: "Why do decision trees overfit and how do you prevent it?", a: "A tree can keep splitting until each leaf contains a single sample, memorising noise. Prevent it with pre-pruning (max_depth, min_samples_split, min_samples_leaf, max_leaf_nodes), post-pruning (cost-complexity pruning via ccp_alpha), or by using ensembles like random forests and gradient boosting.", level: "Easy" },
    { q: "What is bagging and why does it work?", a: "Bagging trains many models on bootstrap samples (sampling with replacement) and averages their predictions. Averaging n models with variance σ² and pairwise correlation ρ gives variance ρσ² + (1−ρ)σ²/n, so it reduces variance — especially for unstable, high-variance learners like deep trees — without increasing bias much.", level: "Medium" },
    { q: "How is a random forest different from bagging decision trees?", a: "Random forest adds feature randomness: at each split only a random subset of features (max_features) is considered. This decorrelates trees (lowers ρ in the variance formula) so averaging is more effective. Plain bagged trees would mostly pick the same dominant features and make correlated errors.", level: "Medium" },
    { q: "What is the out-of-bag (OOB) score?", a: "Each tree's bootstrap sample leaves out about 36.8% of rows. For each training row, we aggregate predictions only from trees that did not see it, and compute accuracy/R² over all rows. This gives a nearly unbiased estimate of generalisation without a separate validation set. Enable with oob_score=True.", level: "Medium" },
    { q: "Do random forests need feature scaling? Can they handle missing values?", a: "No scaling is needed because splits depend on value ordering, not magnitudes. Since sklearn 1.4, DecisionTree and RandomForest support missing values natively in many cases; older versions required imputation. HistGradientBoosting has supported NaN for longer.", level: "Medium" },
    { q: "What are the main hyperparameters of a random forest?", a: "n_estimators (number of trees, more is better until plateau), max_features (features considered per split — the most important for decorrelation), max_depth / min_samples_leaf / min_samples_split (tree complexity), bootstrap and max_samples (sample size per tree), class_weight for imbalance, and n_jobs for parallelism.", level: "Medium" },
    { q: "Why can impurity-based feature importance be misleading?", a: "It is biased towards features with many unique values (continuous or high-cardinality categoricals) because they offer more split points, and it is computed on training data, so it can reward features used to overfit. Correlated features split the importance between them. Prefer permutation importance on a validation set, or SHAP values.", level: "Hard" },
    { q: "Can a random forest extrapolate? What does that mean in practice?", a: "No. Leaf predictions are averages of training targets, so predictions are bounded by the min and max of training targets. If prices rise beyond anything seen in training, the forest will under-predict. For trending time series, linear models or adding de-trended targets work better.", level: "Hard" },
    { q: "Decision tree vs random forest — when would you use a single tree?", a: "Use a single shallow tree when interpretability is crucial (you must show the rules to regulators or business users), data is small, or as a quick exploratory tool. Use a random forest when you want higher accuracy and stability and can accept less transparency.", level: "Easy" },
    { q: "What is the probability that a given row is not selected in a bootstrap sample?", a: "Each draw misses the row with probability (1 − 1/n). Over n draws: (1 − 1/n)ⁿ → e⁻¹ ≈ 0.368 as n grows. So about 36.8% of rows are out-of-bag and 63.2% are in each bootstrap sample.", level: "Hard" },
  ],
  practice: [
    {
      task: "A node contains 30 'churn' and 10 'stay' customers. Compute its Gini impurity and entropy by hand.",
      hint: "p(churn) = 0.75, p(stay) = 0.25.",
      solution: "Gini = 1 − (0.75² + 0.25²) = 1 − (0.5625 + 0.0625) = 0.375\nEntropy = −(0.75·log2 0.75 + 0.25·log2 0.25) = −(0.75·(−0.415) + 0.25·(−2)) ≈ 0.311 + 0.5 = 0.811 bits",
    },
    {
      task: "Using cost-complexity pruning, find the ccp_alpha for a DecisionTreeClassifier on load_breast_cancer that gives the best test accuracy. Use cost_complexity_pruning_path on training data.",
      hint: "path = tree.cost_complexity_pruning_path(X_tr, y_tr); loop over path.ccp_alphas.",
      solution: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
path = DecisionTreeClassifier(random_state=42).cost_complexity_pruning_path(X_tr, y_tr)
best = max(
    ((a, DecisionTreeClassifier(random_state=42, ccp_alpha=a).fit(X_tr, y_tr).score(X_te, y_te))
     for a in path.ccp_alphas[:-1]),            # last alpha leaves only the root
    key=lambda t: t[1])
print("best alpha=%.4f test acc=%.3f" % best)
# In a real project choose alpha with cross-validation, not the test set.`,
    },
    {
      task: "Train RandomForestClassifier on load_wine and print the top 5 features by permutation importance on a 30% test set.",
      hint: "permutation_importance(model, X_te, y_te, n_repeats=10, random_state=0).",
      solution: `import pandas as pd
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance

d = load_wine(as_frame=True)
X_tr, X_te, y_tr, y_te = train_test_split(d.data, d.target, test_size=0.3,
                                          random_state=0, stratify=d.target)
rf = RandomForestClassifier(n_estimators=300, random_state=0).fit(X_tr, y_tr)
r = permutation_importance(rf, X_te, y_te, n_repeats=10, random_state=0)
print(pd.Series(r.importances_mean, index=d.data.columns).nlargest(5))
# Here color_intensity and proline rank highest, followed by od280/od315, alcohol and flavanoids.`,
    },
    {
      task: "Verify empirically that about 63.2% of unique rows appear in a bootstrap sample of size n = 10,000.",
      hint: "rng.integers(0, n, n) draws indices with replacement; count np.unique.",
      solution: `import numpy as np
rng = np.random.default_rng(42)
n = 10_000
idx = rng.integers(0, n, n)
print(len(np.unique(idx)) / n)    # ≈ 0.632
print(1 - (1 - 1/n) ** n)         # theoretical ≈ 0.632`,
    },
  ],
  quiz: [
    { question: "Gini impurity of a node with 50% class A and 50% class B is:", options: ["0", "0.25", "0.5", "1"], answer: 2, explanation: "1 − (0.5² + 0.5²) = 0.5, the maximum for two classes." },
    { question: "Random forests mainly reduce:", options: ["Bias", "Variance", "Training time", "Number of features"], answer: 1, explanation: "Averaging many decorrelated high-variance trees reduces variance." },
    { question: "What extra randomness does a random forest add on top of bagging?", options: ["Random labels", "Random subset of features at each split", "Random learning rate", "Random depth per tree"], answer: 1, explanation: "max_features controls the random feature subset considered at each split, which decorrelates trees." },
    { question: "Approximately what fraction of rows are out-of-bag for each tree?", options: ["10%", "25%", "36.8%", "50%"], answer: 2, explanation: "(1 − 1/n)ⁿ ≈ e⁻¹ ≈ 0.368." },
    { question: "Which hyperparameter does NOT directly limit tree complexity?", options: ["max_depth", "min_samples_leaf", "random_state", "ccp_alpha"], answer: 2, explanation: "random_state only controls reproducibility of randomness." },
    { question: "Which importance method is more reliable for a feature with many unique values?", options: ["Impurity-based importance", "Permutation importance on validation data", "Coefficient size", "Number of splits"], answer: 1, explanation: "Impurity importance is biased towards high-cardinality features; permutation importance on held-out data is not." },
  ],
};
