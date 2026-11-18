export default {
  id: "day-08-clustering-kmeans-dbscan-hierarchical-pca",
  title: "Clustering (K-Means, Elbow, Silhouette, DBSCAN, Hierarchical) and PCA",
  module: "Module 3: Unsupervised & Model Quality",
  day: 8,
  level: "Advanced",
  duration: "3 hours",
  summary: "Unsupervised learning finds structure without labels. Learn K-Means and how to choose k with the elbow method and silhouette score, density-based DBSCAN for odd-shaped clusters and outliers, hierarchical clustering with dendrograms, and Principal Component Analysis (PCA) for dimensionality reduction.",
  objectives: [
    "Explain the K-Means algorithm, inertia and the k-means++ initialisation",
    "Choose the number of clusters using the elbow method and silhouette score",
    "Use DBSCAN (eps, min_samples) to find arbitrary-shaped clusters and noise",
    "Apply agglomerative hierarchical clustering and explain linkage methods",
    "Use PCA to reduce dimensions and interpret explained variance",
  ],
  theory: [
    {
      heading: "K-Means: the Algorithm",
      content: "K-Means splits data into k groups so that points in a group are close to their group's centre (**centroid**). Steps:\n\n1. Choose k and place k initial centroids. 2. **Assign** each point to its nearest centroid. 3. **Update** each centroid to the mean of its assigned points. 4. Repeat 2-3 until assignments stop changing.\n\nIt minimises **inertia** (within-cluster sum of squared distances, WCSS). It always converges, but possibly to a local minimum, so sklearn runs several initialisations (`n_init`) and keeps the best. **k-means++** initialisation spreads the starting centroids apart, which speeds convergence and improves results.",
      points: [
        "Scale features first — K-Means is distance-based",
        "Assumes roughly spherical, similar-sized clusters; struggles with elongated or nested shapes",
        "Sensitive to outliers (means are pulled by them); K-Medoids is a robust alternative",
        "MiniBatchKMeans scales to millions of rows",
      ],
    },
    {
      heading: "Choosing k: Elbow and Silhouette",
      content: "**Elbow method**: plot inertia vs k. Inertia always falls as k rises (k = n gives 0), but the drop slows sharply after the 'natural' k — the elbow. It can be ambiguous.\n\n**Silhouette score** for a point: s = (b − a) / max(a, b), where a = mean distance to points in its own cluster and b = mean distance to points in the nearest other cluster. Ranges −1 to 1: near 1 = well clustered, 0 = on a border, negative = probably in the wrong cluster. Choose the k with the highest average silhouette.\n\nOther metrics: Davies-Bouldin (lower is better), Calinski-Harabasz (higher is better). Most importantly, clusters must make **business sense** — can marketing act on them?",
    },
    {
      heading: "DBSCAN: Density-Based Clustering",
      content: "DBSCAN groups points that are packed closely together and marks isolated points as **noise** (label −1). Two parameters: **eps** (neighbourhood radius) and **min_samples** (points needed within eps to form a dense region).\n\n**Core point**: has ≥ min_samples neighbours within eps. **Border point**: within eps of a core point but not core itself. **Noise**: neither.\n\nAdvantages: no need to choose k, finds arbitrary shapes (moons, rings), detects outliers. Disadvantages: struggles when clusters have very different densities, sensitive to eps, and needs scaled features. Choose eps with a **k-distance plot** (sorted distance to the min_samples-th neighbour; pick the knee). HDBSCAN (sklearn.cluster.HDBSCAN) handles varying densities better.",
    },
    {
      heading: "Hierarchical (Agglomerative) Clustering",
      content: "Start with every point as its own cluster, then repeatedly **merge the two closest clusters** until one remains. The merge history forms a tree called a **dendrogram**; cutting it at a height gives the clusters.\n\n**Linkage** defines distance between clusters: **single** (closest pair — can create long chains), **complete** (farthest pair — compact clusters), **average** (mean of all pairs), **ward** (merge that least increases total within-cluster variance — default in sklearn, similar to K-Means).\n\nNo need to pre-decide k if you inspect the dendrogram, and results are deterministic. Downside: O(n²) memory and at least O(n²) time — fine for a few thousand rows, not millions.",
    },
    {
      heading: "PCA: Principal Component Analysis",
      content: "PCA finds new axes (**principal components**) that are linear combinations of the original features. PC1 points in the direction of **maximum variance**, PC2 is perpendicular to PC1 with the next highest variance, and so on. Keeping only the first few components compresses data while keeping most of the information.\n\nMathematically, components are the **eigenvectors of the covariance matrix** (computed via SVD); their eigenvalues are the variances captured. `explained_variance_ratio_` tells you the fraction of variance each component keeps.\n\nUses: visualising high-dimensional data in 2D, speeding up models, removing multicollinearity, denoising. Always **standardise first**, otherwise large-unit features dominate. Downsides: components are hard to interpret, and PCA captures only linear structure (t-SNE / UMAP for non-linear visualisation).",
      syntax: `from sklearn.decomposition import PCA
pca = PCA(n_components=0.95)     # keep enough components for 95% variance
X_reduced = pca.fit_transform(X_scaled)
pca.explained_variance_ratio_`,
      tip: "PCA is unsupervised: it ignores y, so the highest-variance directions are not guaranteed to be the most predictive.",
    },
    {
      heading: "Business Uses of Unsupervised Learning",
      content: "Unsupervised methods are common in Indian industry interviews because e-commerce, fintech and telecom companies use them heavily.",
      points: [
        "Customer segmentation (RFM: recency, frequency, monetary) for targeted offers",
        "Anomaly / fraud detection: DBSCAN noise points, IsolationForest",
        "Document / news topic grouping",
        "Image compression (colour quantisation with K-Means)",
        "Feature creation: cluster ID or distance-to-centroid as features for a supervised model",
      ],
    },
  ],
  examples: [
    {
      title: "K-Means Customer Segmentation",
      scenario: "A retail company has annual income and spending score for customers and wants marketing segments.",
      steps: [
        "Generate 4 customer groups with make_blobs (stand-in for real data)",
        "Scale features",
        "Fit KMeans(n_clusters=4) and inspect centroids and cluster sizes",
      ],
      code: `import numpy as np
import pandas as pd
from sklearn.datasets import make_blobs
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

X, _ = make_blobs(n_samples=400, centers=[[30, 20], [30, 80], [90, 20], [90, 80]],
                  cluster_std=8, random_state=42)
df = pd.DataFrame(X, columns=["income_k", "spend_score"])

scaler = StandardScaler()
Xs = scaler.fit_transform(df)
km = KMeans(n_clusters=4, n_init=10, random_state=42).fit(Xs)
df["segment"] = km.labels_

centres = pd.DataFrame(scaler.inverse_transform(km.cluster_centers_),
                       columns=["income_k", "spend_score"]).round(1)
centres["size"] = np.bincount(km.labels_)
print(centres)
print("Inertia:", round(km.inertia_, 2))
`,
      python: { files: { "main.py": `import numpy as np
import pandas as pd
from sklearn.datasets import make_blobs
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

X, _ = make_blobs(n_samples=400, centers=[[30, 20], [30, 80], [90, 20], [90, 80]],
                  cluster_std=8, random_state=42)
df = pd.DataFrame(X, columns=["income_k", "spend_score"])

scaler = StandardScaler()
Xs = scaler.fit_transform(df)
km = KMeans(n_clusters=4, n_init=10, random_state=42).fit(Xs)
df["segment"] = km.labels_

centres = pd.DataFrame(scaler.inverse_transform(km.cluster_centers_),
                       columns=["income_k", "spend_score"]).round(1)
centres["size"] = np.bincount(km.labels_)
print(centres)
print("Inertia:", round(km.inertia_, 2))
` } },
      result: "   income_k  spend_score  size\n0      31.0         80.3   100\n1      89.6         19.0   100\n2      29.1         20.3   100\n3      89.4         80.8   100\nInertia: 50.73",
      explanation: "K-Means recovered the four groups. Converting centroids back to original units (inverse_transform) makes them explainable: e.g. 'high income, low spend' customers might respond to premium-quality messaging, and 'low income, high spend' to EMI offers. Cluster numbers themselves are arbitrary labels.",
    },
    {
      title: "Elbow Method and Silhouette Score",
      scenario: "You do not know how many segments exist. Compare inertia and silhouette for k = 2 to 7.",
      steps: [
        "Generate data with 4 true clusters",
        "Fit KMeans for k in 2..7",
        "Print inertia and silhouette score and pick k",
      ],
      code: `from sklearn.datasets import make_blobs
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

X, _ = make_blobs(n_samples=500, centers=4, cluster_std=1.0, random_state=7)
Xs = StandardScaler().fit_transform(X)

for k in range(2, 8):
    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(Xs)
    print(f"k={k} inertia={km.inertia_:8.1f} silhouette={silhouette_score(Xs, km.labels_):.3f}")
`,
      python: { files: { "main.py": `from sklearn.datasets import make_blobs
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

X, _ = make_blobs(n_samples=500, centers=4, cluster_std=1.0, random_state=7)
Xs = StandardScaler().fit_transform(X)

for k in range(2, 8):
    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(Xs)
    print(f"k={k} inertia={km.inertia_:8.1f} silhouette={silhouette_score(Xs, km.labels_):.3f}")
` } },
      result: "k=2 inertia=   406.3 silhouette=0.595\nk=3 inertia=   106.4 silhouette=0.768\nk=4 inertia=    25.7 silhouette=0.801\nk=5 inertia=    22.5 silhouette=0.693\nk=6 inertia=    19.9 silhouette=0.592\nk=7 inertia=    17.8 silhouette=0.471",
      explanation: "Inertia drops steeply until k = 4 and only slowly after that — the elbow. The silhouette score peaks at (or very near) the true k. Using both methods together, plus business judgement, gives a confident choice.",
    },
    {
      title: "DBSCAN Finds Moon Shapes and Outliers",
      scenario: "Two interleaving half-moons plus a few random outliers: K-Means cuts the moons in half, DBSCAN separates them and flags noise.",
      steps: [
        "Create make_moons data and add 10 uniform-random outliers",
        "Run KMeans(k=2) and DBSCAN(eps=0.3, min_samples=5) on scaled data",
        "Compare with the true moon labels using adjusted_rand_score",
      ],
      code: `import numpy as np
from sklearn.datasets import make_moons
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import adjusted_rand_score

X, y = make_moons(n_samples=300, noise=0.06, random_state=42)
rng = np.random.default_rng(0)
outliers = rng.uniform(low=[-1.5, -1.0], high=[2.5, 1.5], size=(10, 2))
X_all = np.vstack([X, outliers])
Xs = StandardScaler().fit_transform(X_all)

km = KMeans(n_clusters=2, n_init=10, random_state=42).fit(Xs)
db = DBSCAN(eps=0.3, min_samples=5).fit(Xs)

print("KMeans ARI on moons:", round(adjusted_rand_score(y, km.labels_[:300]), 3))
print("DBSCAN ARI on moons:", round(adjusted_rand_score(y, db.labels_[:300]), 3))
print("DBSCAN clusters found:", len(set(db.labels_)) - (1 if -1 in db.labels_ else 0))
print("Points labelled noise (-1):", int((db.labels_ == -1).sum()))
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.datasets import make_moons
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import adjusted_rand_score

X, y = make_moons(n_samples=300, noise=0.06, random_state=42)
rng = np.random.default_rng(0)
outliers = rng.uniform(low=[-1.5, -1.0], high=[2.5, 1.5], size=(10, 2))
X_all = np.vstack([X, outliers])
Xs = StandardScaler().fit_transform(X_all)

km = KMeans(n_clusters=2, n_init=10, random_state=42).fit(Xs)
db = DBSCAN(eps=0.3, min_samples=5).fit(Xs)

print("KMeans ARI on moons:", round(adjusted_rand_score(y, km.labels_[:300]), 3))
print("DBSCAN ARI on moons:", round(adjusted_rand_score(y, db.labels_[:300]), 3))
print("DBSCAN clusters found:", len(set(db.labels_)) - (1 if -1 in db.labels_ else 0))
print("Points labelled noise (-1):", int((db.labels_ == -1).sum()))
` } },
      result: "KMeans ARI on moons: 0.47\nDBSCAN ARI on moons: 1.0\nDBSCAN clusters found: 2\nPoints labelled noise (-1): 6",
      explanation: "Adjusted Rand Index (ARI) compares clusters with true labels (1 = perfect, ~0 = random). K-Means assumes round clusters and splits the moons with a straight boundary. DBSCAN follows the density of points, recovers both moons perfectly (ARI 1.0) and labels isolated points as noise (−1) — 6 of the 10 random points were far enough from the moons to be flagged, making it useful for outlier detection.",
    },
    {
      title: "Hierarchical Clustering with Different Linkages",
      scenario: "Cluster the iris flowers (pretending we have no labels) and compare linkage methods against the true species.",
      steps: [
        "Scale iris features",
        "Run AgglomerativeClustering(n_clusters=3) with ward, complete, average and single linkage",
        "Score each against true species with ARI",
      ],
      code: `from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import adjusted_rand_score
import numpy as np

X, y = load_iris(return_X_y=True)
Xs = StandardScaler().fit_transform(X)

for linkage in ["ward", "complete", "average", "single"]:
    labels = AgglomerativeClustering(n_clusters=3, linkage=linkage).fit_predict(Xs)
    print(f"{linkage:8s} ARI={adjusted_rand_score(y, labels):.3f} sizes={np.bincount(labels)}")
`,
      python: { files: { "main.py": `from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import adjusted_rand_score
import numpy as np

X, y = load_iris(return_X_y=True)
Xs = StandardScaler().fit_transform(X)

for linkage in ["ward", "complete", "average", "single"]:
    labels = AgglomerativeClustering(n_clusters=3, linkage=linkage).fit_predict(Xs)
    print(f"{linkage:8s} ARI={adjusted_rand_score(y, labels):.3f} sizes={np.bincount(labels)}")
` } },
      result: "ward     ARI=0.615 sizes=[71 49 30]\ncomplete ARI=0.573 sizes=[77 49 24]\naverage  ARI=0.562 sizes=[50 97  3]\nsingle   ARI=0.558 sizes=[100   1  49]",
      explanation: "Ward linkage produces balanced, compact clusters that match the species best. Average and single linkage produce very unbalanced clusters: single linkage 'chains' versicolor and virginica into one 100-point group and wastes a cluster on a single outlying flower — a well-known weakness. To draw the dendrogram you would use scipy.cluster.hierarchy.linkage and dendrogram with matplotlib.",
    },
    {
      title: "PCA: Compress 30 Features and Keep Accuracy",
      scenario: "The breast cancer dataset has 30 correlated features. How many principal components keep 95% of the variance, and does a classifier still work?",
      steps: [
        "Standardise the 30 features",
        "Fit PCA and print the cumulative explained variance",
        "Train logistic regression on all features vs 2 components vs the 95% set",
      ],
      code: `import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.linear_model import LogisticRegression

X, y = load_breast_cancer(return_X_y=True)
pca = PCA().fit(StandardScaler().fit_transform(X))
cum = np.cumsum(pca.explained_variance_ratio_)
print("Variance of first 3 PCs:", pca.explained_variance_ratio_[:3].round(3))
print("Components for 95% variance:", int(np.argmax(cum >= 0.95)) + 1)

for name, n in [("all 30 features", None), ("2 PCs", 2), ("95% variance", 0.95)]:
    steps = [StandardScaler()] + ([PCA(n_components=n)] if n else []) + [LogisticRegression(max_iter=1000)]
    acc = cross_val_score(make_pipeline(*steps), X, y, cv=5).mean()
    print(f"{name:16s} CV accuracy={acc:.3f}")
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.linear_model import LogisticRegression

X, y = load_breast_cancer(return_X_y=True)
pca = PCA().fit(StandardScaler().fit_transform(X))
cum = np.cumsum(pca.explained_variance_ratio_)
print("Variance of first 3 PCs:", pca.explained_variance_ratio_[:3].round(3))
print("Components for 95% variance:", int(np.argmax(cum >= 0.95)) + 1)

for name, n in [("all 30 features", None), ("2 PCs", 2), ("95% variance", 0.95)]:
    steps = [StandardScaler()] + ([PCA(n_components=n)] if n else []) + [LogisticRegression(max_iter=1000)]
    acc = cross_val_score(make_pipeline(*steps), X, y, cv=5).mean()
    print(f"{name:16s} CV accuracy={acc:.3f}")
` } },
      result: "Variance of first 3 PCs: [0.443 0.19  0.094]\nComponents for 95% variance: 10\nall 30 features  CV accuracy=0.981\n2 PCs            CV accuracy=0.951\n95% variance     CV accuracy=0.981",
      explanation: "The first component alone captures about 44% of the variance because many features (radius, perimeter, area) are strongly correlated. Ten components keep 95%. Even 2 components give a respectable accuracy, and the 95% set performs about as well as all 30 features — less data, nearly the same performance. PCA sits inside the pipeline so it is fitted only on training folds.",
    },
  ],
  interview: [
    { q: "Explain the K-Means algorithm.", a: "Choose k, initialise k centroids (k-means++), assign each point to its nearest centroid, recompute each centroid as the mean of its points, and repeat assignment and update until convergence. It minimises within-cluster sum of squares (inertia). Run with multiple initialisations to avoid poor local minima.", level: "Easy" },
    { q: "How do you choose the number of clusters?", a: "Elbow method (plot inertia vs k and look for the bend), silhouette score (choose k with highest average silhouette), Davies-Bouldin and Calinski-Harabasz indices, gap statistic, dendrogram inspection for hierarchical clustering, and above all business interpretability and actionability of the segments.", level: "Medium" },
    { q: "What is the silhouette score?", a: "For each point, s = (b − a)/max(a, b), where a is the mean distance to other points in the same cluster and b is the mean distance to points in the nearest neighbouring cluster. It ranges from −1 to 1; values near 1 indicate well-separated clusters, near 0 overlapping clusters, negative suggests misassignment. The average over all points evaluates the clustering.", level: "Medium" },
    { q: "What are the limitations of K-Means?", a: "Must choose k in advance; assumes spherical, similarly sized and similarly dense clusters; sensitive to initialisation, outliers and feature scale; only works with numeric data where a mean makes sense (use K-Modes/K-Prototypes for categorical); converges to local optima.", level: "Medium" },
    { q: "How does DBSCAN work and when would you use it instead of K-Means?", a: "DBSCAN defines core points with at least min_samples neighbours within radius eps, expands clusters from core points through density-reachable points, and marks points not reachable from any core point as noise. Use it when clusters have arbitrary shapes, when you do not know the number of clusters, or when you want explicit outlier detection.", level: "Medium" },
    { q: "How do you choose eps for DBSCAN?", a: "Use a k-distance plot: for each point compute the distance to its k-th nearest neighbour (k = min_samples), sort these distances and plot them; the 'knee' where the curve rises sharply is a good eps. min_samples is often set to around 2 × number of dimensions. Scale features first.", level: "Hard" },
    { q: "Explain the different linkage methods in hierarchical clustering.", a: "Single linkage uses the minimum distance between points of two clusters (finds chains, sensitive to noise). Complete linkage uses the maximum distance (compact clusters). Average linkage uses the mean pairwise distance. Ward linkage merges clusters that cause the smallest increase in within-cluster variance, producing balanced spherical clusters similar to K-Means.", level: "Medium" },
    { q: "What is PCA and how does it work?", a: "PCA is a linear dimensionality reduction technique that projects data onto orthogonal directions of maximum variance. After standardising, it computes the covariance matrix's eigenvectors (principal components) and eigenvalues (variance captured) — in practice via SVD. Keeping the top components preserves most variance with fewer dimensions.", level: "Medium" },
    { q: "Why must you scale data before PCA?", a: "PCA maximises variance, and variance depends on units. A feature measured in rupees (variance in crores) would dominate the first component even if it carries no more information than a feature measured in years. Standardising gives each feature equal initial weight.", level: "Easy" },
    { q: "Is PCA a feature selection method?", a: "No, it is feature extraction. Each principal component is a linear combination of all original features, so you do not keep a subset of original columns. Feature selection (e.g. SelectKBest, Lasso) keeps original, interpretable features.", level: "Medium" },
    { q: "How would you evaluate a clustering when you have no labels?", a: "Internal metrics: silhouette, Davies-Bouldin, Calinski-Harabasz, inertia. Stability: do clusters stay the same across bootstrap samples or random seeds? Business validation: profile clusters (mean of features), check they are distinct, sizeable and actionable, and run A/B tests on campaigns per segment. If some labels exist, use ARI or NMI.", level: "Hard" },
    { q: "PCA vs t-SNE vs UMAP?", a: "PCA is linear, fast, deterministic and invertible; good for compression and preprocessing. t-SNE is non-linear, preserves local neighbourhoods, great for 2D visualisation of clusters but slow, stochastic, and distances between clusters are not meaningful. UMAP is also non-linear, faster than t-SNE, preserves more global structure, and can transform new data. Use t-SNE/UMAP for visualisation, PCA for modelling pipelines.", level: "Hard" },
  ],
  practice: [
    {
      task: "Run K-Means with k=3 on scaled iris data (ignore labels). Then compare cluster labels with the true species using pd.crosstab and ARI.",
      hint: "pd.crosstab(y, km.labels_). Cluster numbers will not match species numbers — look at the pattern.",
      solution: `import pandas as pd
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score

X, y = load_iris(return_X_y=True)
km = KMeans(n_clusters=3, n_init=10, random_state=42).fit(StandardScaler().fit_transform(X))
print(pd.crosstab(y, km.labels_))
print("ARI:", round(adjusted_rand_score(y, km.labels_), 3))
# Setosa forms its own perfect cluster; versicolor and virginica overlap partially (ARI ~0.6).`,
    },
    {
      task: "Compute the silhouette coefficient by hand for point P in cluster A = {P(0,0), Q(0,2)}, nearest other cluster B = {R(4,0), S(4,2)}.",
      hint: "a = mean distance from P to other members of A; b = mean distance from P to members of B.",
      solution: "a = d(P, Q) = 2.\nb = mean(d(P, R), d(P, S)) = mean(4, √20 ≈ 4.472) = 4.236.\ns = (b − a) / max(a, b) = (4.236 − 2) / 4.236 ≈ 0.528 → reasonably well clustered.",
    },
    {
      task: "Use PCA(n_components=2) on scaled load_wine data and print the explained variance ratio of each component. How much total variance do 2 components keep?",
      hint: "pca.explained_variance_ratio_.sum().",
      solution: `from sklearn.datasets import load_wine
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

X, y = load_wine(return_X_y=True)
pca = PCA(n_components=2).fit(StandardScaler().fit_transform(X))
print(pca.explained_variance_ratio_.round(3))     # ~[0.362 0.192]
print(round(pca.explained_variance_ratio_.sum(), 3))  # ~0.554 → 55% of the variance in 2D`,
    },
    {
      task: "Use DBSCAN as an anomaly detector: generate make_blobs(n_samples=300, centers=3, cluster_std=0.6, random_state=0), append 5 points far away, scale, and run DBSCAN(eps=0.3, min_samples=5). Print the indices labelled as noise.",
      hint: "np.where(db.labels_ == -1)[0]. The appended points have indices 300-304.",
      solution: `import numpy as np
from sklearn.datasets import make_blobs
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN

X, _ = make_blobs(n_samples=300, centers=3, cluster_std=0.6, random_state=0)
far = np.array([[10, 10], [-10, 8], [12, -6], [-9, -9], [0, 15]])
Xs = StandardScaler().fit_transform(np.vstack([X, far]))
db = DBSCAN(eps=0.3, min_samples=5).fit(Xs)
print(np.where(db.labels_ == -1)[0])
# Indices 300-304 are flagged, plus possibly a few edge points of the blobs.
# Tune eps with a k-distance plot to control how strict the detector is.`,
    },
  ],
  quiz: [
    { question: "What does K-Means minimise?", options: ["Silhouette score", "Within-cluster sum of squared distances (inertia)", "Number of clusters", "Distance between centroids"], answer: 1, explanation: "K-Means minimises inertia — the sum of squared distances of points to their cluster centroid." },
    { question: "A silhouette score close to −1 for a point means:", options: ["It is well clustered", "It is on a border", "It is probably in the wrong cluster", "It is a centroid"], answer: 2, explanation: "Negative silhouette means the point is closer to another cluster than to its own." },
    { question: "Which algorithm labels outliers as −1?", options: ["K-Means", "DBSCAN", "PCA", "Agglomerative clustering"], answer: 1, explanation: "DBSCAN assigns noise points the label −1." },
    { question: "PC1 in PCA is the direction of:", options: ["Minimum variance", "Maximum variance", "Highest correlation with y", "The first original feature"], answer: 1, explanation: "Principal components are ordered by variance captured; PC1 captures the most." },
    { question: "Which linkage tends to create long 'chains'?", options: ["Ward", "Complete", "Average", "Single"], answer: 3, explanation: "Single linkage merges based on the closest pair of points, leading to chaining." },
    { question: "Why is k-means++ used?", options: ["To choose k automatically", "To spread out initial centroids for better, faster convergence", "To handle categorical data", "To detect outliers"], answer: 1, explanation: "k-means++ chooses initial centroids far apart, reducing poor local minima." },
  ],
};
