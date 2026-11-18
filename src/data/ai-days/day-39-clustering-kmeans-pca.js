export default {
  id: "day-39-clustering-kmeans-pca",
  title: "Clustering (k-means) and Dimensionality Reduction (PCA)",
  module: "Module 6: Machine Learning Hands-on",
  day: 39,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Move to unsupervised learning, where there are no labels. Use k-means clustering to discover natural groups (customer segments, document topics, store types), choose the number of clusters with the elbow method and silhouette score, and understand PCA (Principal Component Analysis) for reducing many features to a few while keeping most of the information - useful for visualisation, speed and noise reduction. Watch k-means move its centres in the ML Playground.",
  objectives: [
    "Explain unsupervised learning and how clustering differs from classification",
    "Describe the k-means algorithm step by step (assign, update, repeat)",
    "Choose k with the elbow method and silhouette score",
    "Explain what PCA does and read explained_variance_ratio_",
    "Apply k-means and PCA with scikit-learn and interpret the results for a business"
  ],
  theory: [
    {
      heading: "Unsupervised Learning and Clustering",
      content: "In supervised learning every row has an answer (label). In unsupervised learning there are no answers - the algorithm must find structure by itself. Clustering groups similar rows together. Analogy: tipping a box of mixed buttons on a table and sorting them into piles by size and colour without anyone telling you the 'correct' piles.",
      points: [
        "Customer segmentation: budget shoppers, loyal premium buyers, occasional visitors.",
        "Grouping news articles or support tickets by topic; grouping similar products; finding store types.",
        "Anomaly detection: points far from every cluster may be fraud or faults.",
        "Image compression: group similar colours into k representative colours.",
        "Clusters have no names - a human must look at them and interpret ('this group is high spend, low visits')."
      ]
    },
    {
      heading: "The k-means Algorithm Step by Step",
      content: "k-means splits the data into k groups, each represented by its centre (centroid = average point). It repeats two simple steps until nothing changes. Analogy: k ice-cream carts on a beach. Each person walks to the nearest cart; then each cart moves to the middle of its crowd; people re-choose; carts move again - until carts stop moving.",
      syntax: `1. Choose k and place k starting centres (k-means++ picks well-spread starting points)
2. ASSIGN: each point joins its nearest centre
3. UPDATE: move each centre to the average of its points
4. Repeat 2-3 until assignments stop changing

from sklearn.cluster import KMeans
km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
km.labels_            # cluster number for each row
km.cluster_centers_   # centre coordinates
km.inertia_           # sum of squared distances to centres (lower = tighter)
km.predict(new_X)     # which cluster a new row belongs to`,
      points: [
        "You must choose k in advance.",
        "Result depends on the starting centres, so scikit-learn runs several starts (n_init) and keeps the best.",
        "Cluster numbers (0, 1, 2) are arbitrary names - running again may swap them.",
        "Scale features first (StandardScaler) - k-means uses distances, just like KNN.",
        "k-means prefers round, similar-size clusters. For odd shapes use DBSCAN; for a tree of groups use hierarchical clustering.",
        "Try it in the ML Playground (/tools/ml-playground): add points, choose k-means, set k and step through the iterations."
      ]
    },
    {
      heading: "Choosing k: Elbow Method and Silhouette Score",
      content: "More clusters always reduce inertia (with k = number of points, inertia is 0), so 'lowest inertia' is not the goal. We look for the point of diminishing returns.",
      points: [
        "Elbow method: plot inertia for k = 1, 2, 3, ... The curve drops steeply then flattens. The bend (elbow) is a good k.",
        "Silhouette score (-1 to 1): how close each point is to its own cluster compared with the next nearest cluster. Higher is better; near 0 means overlapping clusters. from sklearn.metrics import silhouette_score.",
        "Business sense matters most: marketing may only be able to handle 3-5 segments.",
        "Check cluster sizes - a cluster with 2 customers is probably not a useful segment."
      ]
    },
    {
      heading: "Dimensionality Reduction and PCA",
      content: "Real datasets can have hundreds of features. Many are correlated (height in cm and height in inches carry the same information). PCA finds new axes (principal components) that capture the most variation, ordered from most to least important. Keeping the first few components keeps most information with far fewer columns. Analogy: photographing a 3-D object from the angle that shows the most detail - a 2-D photo still tells you most of what you need.",
      syntax: `from sklearn.decomposition import PCA
pca = PCA(n_components=2)
X_2d = pca.fit_transform(X_scaled)     # new, shorter table
pca.explained_variance_ratio_          # share of information kept by each component
PCA(n_components=0.95)                 # keep enough components for 95% of the variance`,
      points: [
        "Uses: plotting high-dimensional data in 2-D, speeding up models, removing noise, reducing multicollinearity.",
        "Components are mixes of the original features, so they are harder to explain than the original columns.",
        "Always standardise before PCA, otherwise large-unit features dominate.",
        "PCA is unsupervised - it ignores the target. Other methods for visualisation: t-SNE and UMAP.",
        "Connection to LLMs: embeddings (Day 12) have hundreds of dimensions; PCA/UMAP are used to draw them as 2-D maps."
      ]
    },
    {
      heading: "From Clusters to Business Action",
      content: "A clustering result is only useful when someone acts on it. After clustering, summarise each cluster (average of every feature, size), give it a human name and decide an action.",
      syntax: `df["cluster"] = km.labels_
df.groupby("cluster").agg(customers=("id", "count"), avg_spend=("spend", "mean"), avg_visits=("visits", "mean"))`,
      points: [
        "Example: Cluster A = high spend, low visits -> 'Big-ticket occasional' -> send premium launch offers.",
        "Cluster B = low spend, high visits -> 'Frequent small buyers' -> loyalty points.",
        "Generative AI can help name segments and draft marketing ideas from the cluster summary table - but a human checks the result.",
        "Re-run clustering periodically; customer behaviour changes."
      ]
    }
  ],
  examples: [
    {
      title: "k-means: Find Two Customer Groups",
      scenario: "Six customers are described by two scaled scores (visits, spend). Find 2 natural groups with k-means and check the centres, inertia and cluster sizes.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code and click Run",
        "Compare with the Result - the centres are printed sorted because cluster numbers are arbitrary",
        "Open the ML Playground (/tools/ml-playground), choose k-means, click similar points in two corners and run with k = 2"
      ],
      code: `import numpy as np
from sklearn.cluster import KMeans

X = np.array([[1, 1], [1.5, 2], [2, 1.5],
              [8, 8], [8.5, 9], [9, 8.5]])

km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)
print("centres:", sorted(np.round(km.cluster_centers_, 2).tolist()))
print("inertia:", round(float(km.inertia_), 2))
print("cluster sizes:", sorted(np.bincount(km.labels_).tolist()))
print("first two customers together?", bool(km.labels_[0] == km.labels_[1]))
print("new point (2, 2) joins customer 1's group?", bool(km.predict([[2, 2]])[0] == km.labels_[0]))`,
      python: {
        files: {
          "main.py": `import numpy as np
from sklearn.cluster import KMeans

X = np.array([[1, 1], [1.5, 2], [2, 1.5],
              [8, 8], [8.5, 9], [9, 8.5]])

km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)
print("centres:", sorted(np.round(km.cluster_centers_, 2).tolist()))
print("inertia:", round(float(km.inertia_), 2))
print("cluster sizes:", sorted(np.bincount(km.labels_).tolist()))
print("first two customers together?", bool(km.labels_[0] == km.labels_[1]))
print("new point (2, 2) joins customer 1's group?", bool(km.predict([[2, 2]])[0] == km.labels_[0]))
`
        },
        stdin: ""
      },
      result: `centres: [[1.5, 1.5], [8.5, 8.5]]
inertia: 2.0
cluster sizes: [3, 3]
first two customers together? True
new point (2, 2) joins customer 1's group? True`,
      explanation: "The two groups are far apart, so k-means puts the first three customers in one cluster and the last three in the other. Centre 1 = average of (1,1), (1.5,2), (2,1.5) = (1.5, 1.5); centre 2 = (8.5, 8.5). Inertia: in each group the squared distances to the centre are 0.5 + 0.25 + 0.25 = 1.0, so the total is 2.0. We print sorted centres and compare labels instead of printing raw cluster numbers, because the numbers 0/1 are arbitrary."
    },
    {
      title: "Elbow Method: How Many Clusters?",
      scenario: "Compute inertia for k = 1, 2 and 3 on the same customers and find the elbow.",
      steps: [
        "Open the Python IDE (/tools/python-ide)",
        "Paste the code and click Run",
        "Notice the huge drop from k = 1 to k = 2 and the tiny drop from k = 2 to k = 3",
        "Sketch the three points on paper - the bend is at k = 2"
      ],
      code: `import numpy as np
from sklearn.cluster import KMeans

X = np.array([[1, 1], [1.5, 2], [2, 1.5],
              [8, 8], [8.5, 9], [9, 8.5]])

for k in [1, 2, 3]:
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    print("k =", k, "inertia =", round(float(km.inertia_), 2))`,
      python: {
        files: {
          "main.py": `import numpy as np
from sklearn.cluster import KMeans

X = np.array([[1, 1], [1.5, 2], [2, 1.5],
              [8, 8], [8.5, 9], [9, 8.5]])

for k in [1, 2, 3]:
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    print("k =", k, "inertia =", round(float(km.inertia_), 2))
`
        },
        stdin: ""
      },
      result: `k = 1 inertia = 149.0
k = 2 inertia = 2.0
k = 3 inertia = 1.25`,
      explanation: "k = 1: one centre at (5, 5); the squared distances add up to 149. k = 2: the two natural groups, inertia 2.0 - a massive improvement. k = 3: the best it can do is split one group (pairing the two closest points), reducing inertia only from 2.0 to 1.25. The drop from 149 to 2 then a flattening curve means the elbow is at k = 2."
    },
    {
      title: "PCA: How Much Information Does One Direction Keep?",
      scenario: "Two features (x, y) rise together. PCA finds the main direction and tells you what share of the variation it captures - can we keep one column instead of two?",
      steps: [
        "Open the Python IDE (/tools/python-ide)",
        "Paste the code and click Run",
        "Read explained_variance_ratio_ - the first number is the share kept by component 1",
        "Change y to random-looking values (e.g. [5, 1, 4, 2, 3]) and run again - the first share drops"
      ],
      code: `import numpy as np
from sklearn.decomposition import PCA

X = np.array([[1, 2], [2, 3], [3, 5], [4, 4], [5, 6]])

pca = PCA(n_components=2).fit(X)
print("explained variance ratio:", np.round(pca.explained_variance_ratio_, 3).tolist())

X_1d = PCA(n_components=1).fit_transform(X)
print("shape before:", X.shape, "after:", X_1d.shape)`,
      python: {
        files: {
          "main.py": `import numpy as np
from sklearn.decomposition import PCA

X = np.array([[1, 2], [2, 3], [3, 5], [4, 4], [5, 6]])

pca = PCA(n_components=2).fit(X)
print("explained variance ratio:", np.round(pca.explained_variance_ratio_, 3).tolist())

X_1d = PCA(n_components=1).fit_transform(X)
print("shape before:", X.shape, "after:", X_1d.shape)
`
        },
        stdin: ""
      },
      result: `explained variance ratio: [0.95, 0.05]
shape before: (5, 2) after: (5, 1)`,
      explanation: "Variance of x = 2.5, variance of y = 2.5, covariance = 2.25. The principal components are the eigenvectors of this covariance matrix; their variances (eigenvalues) are 2.5 + 2.25 = 4.75 and 2.5 - 2.25 = 0.25. Shares: 4.75/5 = 0.95 and 0.25/5 = 0.05. So one component keeps 95% of the information and we can go from 2 columns to 1 with little loss. (The sign of the transformed values can flip between versions, so we print only the shape.)"
    },
    {
      title: "Pure-Python k-means and PCA (Runs Anywhere)",
      scenario: "Implement the assign/update loop of k-means and the 2-D PCA variance calculation by hand, so nothing is a black box.",
      steps: [
        "Open the Python IDE (/tools/python-ide) or any Python 3",
        "Paste the code and click Run",
        "Watch the centres - they settle after the first step and then stay the same (converged)",
        "Change the starting centres to points[0] and points[1] and see if it still converges to the same answer"
      ],
      code: `# Pure-Python k-means (k=2) with a fixed starting guess
points = [(1, 1), (1.5, 2), (2, 1.5), (8, 8), (8.5, 9), (9, 8.5)]
centers = [points[0], points[3]]          # start: first point of each group
for step in range(1, 4):
    groups = [[], []]
    for p in points:
        d = [(p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 for c in centers]
        groups[d.index(min(d))].append(p)
    centers = [(sum(x for x, y in g) / len(g), sum(y for x, y in g) / len(g)) for g in groups]
    print("step", step, "centers:", centers)
inertia = sum(min((p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 for c in centers) for p in points)
print("inertia:", inertia)

# PCA idea: how much variance does the main direction capture?
xs = [1, 2, 3, 4, 5]
ys = [2, 3, 5, 4, 6]
n = len(xs)
mx, my = sum(xs) / n, sum(ys) / n
sxx = sum((x - mx) ** 2 for x in xs) / (n - 1)
syy = sum((y - my) ** 2 for y in ys) / (n - 1)
sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / (n - 1)
tr, det = sxx + syy, sxx * syy - sxy ** 2
l1 = tr / 2 + ((tr / 2) ** 2 - det) ** 0.5
l2 = tr / 2 - ((tr / 2) ** 2 - det) ** 0.5
print("explained variance ratio:", [round(l1 / tr, 3), round(l2 / tr, 3)])`,
      python: {
        files: {
          "main.py": `# Pure-Python k-means (k=2) with a fixed starting guess
points = [(1, 1), (1.5, 2), (2, 1.5), (8, 8), (8.5, 9), (9, 8.5)]
centers = [points[0], points[3]]          # start: first point of each group
for step in range(1, 4):
    groups = [[], []]
    for p in points:
        d = [(p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 for c in centers]
        groups[d.index(min(d))].append(p)
    centers = [(sum(x for x, y in g) / len(g), sum(y for x, y in g) / len(g)) for g in groups]
    print("step", step, "centers:", centers)
inertia = sum(min((p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 for c in centers) for p in points)
print("inertia:", inertia)

# PCA idea: how much variance does the main direction capture?
xs = [1, 2, 3, 4, 5]
ys = [2, 3, 5, 4, 6]
n = len(xs)
mx, my = sum(xs) / n, sum(ys) / n
sxx = sum((x - mx) ** 2 for x in xs) / (n - 1)
syy = sum((y - my) ** 2 for y in ys) / (n - 1)
sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / (n - 1)
tr, det = sxx + syy, sxx * syy - sxy ** 2
l1 = tr / 2 + ((tr / 2) ** 2 - det) ** 0.5
l2 = tr / 2 - ((tr / 2) ** 2 - det) ** 0.5
print("explained variance ratio:", [round(l1 / tr, 3), round(l2 / tr, 3)])
`
        },
        stdin: ""
      },
      result: `step 1 centers: [(1.5, 1.5), (8.5, 8.5)]
step 2 centers: [(1.5, 1.5), (8.5, 8.5)]
step 3 centers: [(1.5, 1.5), (8.5, 8.5)]
inertia: 2.0
explained variance ratio: [0.95, 0.05]`,
      explanation: "Step 1 assigns each point to the nearer starting centre and moves the centres to the group averages (1.5, 1.5) and (8.5, 8.5). Steps 2-3 change nothing - the algorithm has converged. For 2-D data the two PCA eigenvalues come from the trace and determinant of the 2x2 covariance matrix, giving the same 0.95 / 0.05 split as scikit-learn."
    },
    {
      title: "Use AI to Name Customer Segments",
      scenario: "Your k-means model produced a summary table of 4 clusters. Use an AI assistant to suggest segment names and marketing actions, then review them critically.",
      steps: [
        "Open the AI Prompt Lab (/tools/ai-lab) or claude.ai / ChatGPT / Gemini",
        "Paste the prompt below (it contains only aggregated numbers - no personal data)",
        "Run it and read the suggested names and actions",
        "Check every name against the numbers - reject any that contradict the data"
      ],
      code: `You are a marketing analyst.
I ran k-means (k = 4) on 2,000 online-shop customers. Cluster summary (averages):
Cluster | customers | orders/year | avg order value (Rs) | days since last order | discount usage
0       | 820       | 3           | 650                  | 45                    | high
1       | 310       | 18          | 900                  | 6                     | low
2       | 540       | 1           | 2,400                | 200                   | low
3       | 330       | 9           | 300                  | 20                    | medium
Task: give each cluster a short descriptive name, one sentence describing it, and two practical marketing actions.
Format: a table Cluster | Name | Description | Actions.
Constraints: base every statement only on the numbers above; flag anything that needs more data to confirm.`,
      prompt: {
        system: "You are a careful marketing analyst. You base every statement on the data given and clearly flag assumptions.",
        user: "I ran k-means (k = 4) on 2,000 online-shop customers. Cluster summary (averages):\nCluster | customers | orders/year | avg order value (Rs) | days since last order | discount usage\n0 | 820 | 3 | 650 | 45 | high\n1 | 310 | 18 | 900 | 6 | low\n2 | 540 | 1 | 2,400 | 200 | low\n3 | 330 | 9 | 300 | 20 | medium\nTask: give each cluster a short descriptive name, one sentence describing it, and two practical marketing actions.\nFormat: a table Cluster | Name | Description | Actions.\nConstraints: base every statement only on the numbers above; flag anything that needs more data to confirm."
      },
      result: "A table similar to: 0 'Deal seekers' (occasional, discount-driven) -> targeted coupons, bundle offers; 1 'Loyal regulars' (frequent, recent, full price) -> loyalty tier, early access; 2 'Lapsed big spenders' (one large order, inactive 200 days) -> win-back campaign, premium recommendations; 3 'Frequent small-basket buyers' -> free-shipping threshold, cross-sell. Plus flags such as 'confirm whether cluster 2 bought a one-off gift'.",
      explanation: "k-means finds the groups; humans (helped by AI) give them meaning. The constraint 'base every statement only on the numbers' reduces hallucinated claims, and asking for flags makes the AI show its uncertainty."
    }
  ],
  tools: [
    { name: "ML Playground", use: "Add points and watch k-means move its centres step by step", url: "/tools/ml-playground" },
    { name: "In-app Python IDE", use: "Run KMeans and PCA with scikit-learn", url: "/tools/python-ide" },
    { name: "AI Concepts Lab", use: "See embeddings and semantic similarity - the same 'distance' idea used by clustering", url: "/tools/ai-concepts" },
    { name: "scikit-learn", use: "KMeans, PCA, silhouette_score", url: "https://scikit-learn.org" }
  ],
  interview: [
    { q: "What is the difference between clustering and classification?", a: "Classification is supervised: it learns from labelled data to predict known categories. Clustering is unsupervised: it groups unlabelled data by similarity, and the groups have no predefined names.", level: "Easy" },
    { q: "Explain the k-means algorithm.", a: "Pick k starting centres; assign every point to its nearest centre; move each centre to the mean of its assigned points; repeat until assignments stop changing. It minimises the within-cluster sum of squared distances (inertia).", level: "Easy" },
    { q: "How do you choose k?", a: "Elbow method on inertia, silhouette score, domain knowledge and practical constraints (how many segments the business can act on), plus checking cluster sizes and stability.", level: "Medium" },
    { q: "What are the limitations of k-means?", a: "Needs k in advance, sensitive to initialisation and outliers, assumes roughly spherical similar-sized clusters, requires scaled numeric features, and labels are arbitrary between runs.", level: "Medium" },
    { q: "What is k-means++?", a: "A smarter initialisation that picks starting centres far apart from each other (with probability proportional to squared distance), which leads to faster convergence and better results. It is scikit-learn's default.", level: "Hard" },
    { q: "Name clustering algorithms other than k-means and when to use them.", a: "DBSCAN for arbitrary shapes and automatic outlier detection without choosing k; hierarchical (agglomerative) clustering for a dendrogram of nested groups; Gaussian Mixture Models for soft (probabilistic) membership and elliptical clusters.", level: "Medium" },
    { q: "What does PCA do?", a: "It finds orthogonal directions (principal components) that capture the maximum variance in the data, ordered by importance, and projects the data onto the top components to reduce dimensions while keeping most information.", level: "Medium" },
    { q: "What is explained_variance_ratio_?", a: "The fraction of the total variance captured by each principal component. Summing the first few tells you how much information you keep; e.g. [0.7, 0.2] means 2 components keep 90%.", level: "Easy" },
    { q: "Why must you scale data before k-means and PCA?", a: "Both depend on distances/variances. Unscaled, a feature with large units (salary) dominates one with small units (age), distorting clusters and components.", level: "Medium" },
    { q: "What is the curse of dimensionality?", a: "As the number of features grows, data becomes sparse and distances between points become similar, which hurts distance-based methods (KNN, k-means) and needs much more data. Dimensionality reduction and feature selection help.", level: "Hard" }
  ],
  practice: [
    {
      task: "In the ML Playground (/tools/ml-playground), draw three separate blobs of points. Run k-means with k = 2, 3 and 4. Write down what happens in each case.",
      hint: "With k = 2 two blobs must share a centre; with k = 4 one blob is split.",
      solution: "k = 2 merges two blobs into one cluster with a centre between them (poor fit). k = 3 matches the real structure. k = 4 splits one blob into two halves - inertia drops a little but the extra cluster is not meaningful. This is the elbow idea in action."
    },
    {
      task: "Run k-means with k = 3 on these 9 points and print the sorted centres: [[1,1],[1,2],[2,1],[5,5],[5,6],[6,5],[9,1],[9,2],[10,1]].",
      hint: "Use KMeans(n_clusters=3, n_init=10, random_state=0) and sorted(np.round(km.cluster_centers_, 2).tolist()).",
      solution: `import numpy as np
from sklearn.cluster import KMeans
X = np.array([[1,1],[1,2],[2,1],[5,5],[5,6],[6,5],[9,1],[9,2],[10,1]])
km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
print(sorted(np.round(km.cluster_centers_, 2).tolist()))
# [[1.33, 1.33], [5.33, 5.33], [9.33, 1.33]]`
    },
    {
      task: "Compute the silhouette score for k = 2 on the 6-customer data from Example 1 and explain the value.",
      hint: "from sklearn.metrics import silhouette_score; silhouette_score(X, km.labels_).",
      solution: "The score is close to 1 (about 0.9) because each point is very close to its own cluster and very far from the other one. Values near 0 would mean overlapping clusters, negative values mean points are probably in the wrong cluster."
    },
    {
      task: "Load the Iris dataset (from sklearn.datasets import load_iris), standardise it, reduce it to 2 components with PCA and print explained_variance_ratio_.",
      hint: "make_pipeline is not needed: X = StandardScaler().fit_transform(load_iris().data); PCA(2).fit(X).",
      solution: `from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import numpy as np
X = StandardScaler().fit_transform(load_iris().data)
pca = PCA(n_components=2).fit(X)
print(np.round(pca.explained_variance_ratio_, 2).tolist())
# about [0.73, 0.23] - two components keep roughly 96% of the information in 4 features`
    },
    {
      task: "Ask an AI assistant: 'When would DBSCAN be better than k-means? Give 3 real examples.' Then test one claim in the ML Playground or Python IDE.",
      hint: "Typical answers mention irregular shapes, unknown k and outliers.",
      solution: "DBSCAN is better for non-spherical shapes (e.g. GPS points along roads), when k is unknown, and when you want noise points labelled as outliers (e.g. unusual transactions). You can test it with sklearn.cluster.DBSCAN(eps=..., min_samples=...) on moon-shaped data from sklearn.datasets.make_moons."
    }
  ],
  quiz: [
    {
      question: "k-means is an example of which type of learning?",
      options: ["Supervised", "Reinforcement", "Unsupervised", "Transfer learning"],
      answer: 2,
      explanation: "k-means uses no labels; it discovers groups by itself."
    },
    {
      question: "In the UPDATE step of k-means, each centre moves to...",
      options: ["the average of the points assigned to it", "a random point", "the farthest point", "the origin (0, 0)"],
      answer: 0,
      explanation: "The centroid is the mean of its cluster's points."
    },
    {
      question: "Why can't you just choose the k with the lowest inertia?",
      options: ["Inertia is always zero", "Inertia only works with PCA", "Higher k is always slower to plot", "Inertia always decreases as k increases, reaching 0 when every point is its own cluster"],
      answer: 3,
      explanation: "So we look for the elbow (diminishing returns) or use silhouette score."
    },
    {
      question: "PCA explained_variance_ratio_ = [0.80, 0.15, 0.05]. How much information do the first two components keep?",
      options: ["80%", "95%", "15%", "100%"],
      answer: 1,
      explanation: "0.80 + 0.15 = 0.95, i.e. 95% of the variance."
    },
    {
      question: "Which statement about k-means cluster numbers (0, 1, 2) is true?",
      options: ["0 is always the largest cluster", "They are sorted by centre position", "They are arbitrary and can change between runs", "They are the same as class labels"],
      answer: 2,
      explanation: "Cluster IDs are just names; interpret clusters by their centres and members, not by their number."
    }
  ]
};
