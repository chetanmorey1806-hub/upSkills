export default {
  id: "day-11-neural-networks-deep-learning-nlp-basics",
  title: "Neural Networks, Deep Learning (Keras / PyTorch Overview) and NLP Basics with TF-IDF",
  module: "Module 4: Deep Learning & Project",
  day: 11,
  level: "Advanced",
  duration: "3.5 hours",
  summary: "Understand how a neural network works — neurons, weights, activation functions, forward pass, loss, backpropagation and gradient descent — train one with scikit-learn's MLPClassifier, see how the same model looks in Keras and PyTorch, and build a practical text classifier with TF-IDF and logistic regression.",
  objectives: [
    "Explain a neuron, layers, activation functions (ReLU, sigmoid, softmax) and the forward pass",
    "Describe loss functions, backpropagation, gradient descent, epochs, batches and learning rate",
    "Train an MLP in scikit-learn and recognise when deep learning is (and is not) the right tool",
    "Read equivalent Keras and PyTorch training code and know the key differences",
    "Build a TF-IDF text classification pipeline and explain tokenisation, n-grams and stop words",
  ],
  theory: [
    {
      heading: "From a Neuron to a Neural Network",
      content: "A **neuron** computes a weighted sum of its inputs plus a bias, then applies an **activation function**: `a = f(w1·x1 + w2·x2 + … + b)`. With a sigmoid activation, a single neuron is exactly logistic regression.\n\nStacking neurons into **layers** gives a **multi-layer perceptron (MLP)**: an input layer (features), one or more **hidden layers**, and an output layer. Each hidden layer learns new, more abstract features from the previous one. 'Deep' learning simply means many hidden layers.\n\nWithout non-linear activations, any stack of layers collapses to a single linear model — the non-linearity is what lets networks learn curves, interactions and complex patterns (the universal approximation theorem).",
      points: [
        "ReLU: max(0, z) — default for hidden layers; fast; avoids vanishing gradients",
        "Sigmoid: 1/(1+e^−z) — output layer for binary classification (probability)",
        "Softmax: turns a vector of scores into probabilities that sum to 1 — multi-class output",
        "Tanh: −1 to 1 — older hidden-layer choice, used inside RNN/LSTM cells",
        "Linear (no activation): regression output",
      ],
    },
    {
      heading: "How Networks Learn: Loss, Backpropagation and Gradient Descent",
      content: "Training loop: (1) **Forward pass** — compute predictions layer by layer. (2) **Loss** — measure the error: binary cross-entropy, categorical cross-entropy or MSE. (3) **Backpropagation** — use the chain rule of calculus to compute the gradient of the loss with respect to every weight, from the output layer backwards. (4) **Update** — move each weight a small step opposite to its gradient: `w = w − learning_rate · ∂L/∂w`.\n\nOne pass over the full training data is an **epoch**. Data is processed in **mini-batches** (e.g. 32 rows) — mini-batch stochastic gradient descent. **Adam** is the most common optimiser: it adapts the learning rate per weight using running averages of gradients.",
      points: [
        "Learning rate too high → loss jumps around or explodes; too low → very slow training",
        "Vanishing gradients: sigmoid/tanh saturate in deep nets → use ReLU, batch normalisation, residual connections",
        "Regularisation: dropout (randomly switch off neurons during training), L2 weight decay, early stopping, data augmentation",
        "Neural nets need scaled inputs and usually much more data than classical ML",
      ],
    },
    {
      heading: "Deep Learning Architectures and When to Use Them",
      content: "**CNNs** (convolutional neural networks) use small filters sliding over images to detect edges, textures and shapes — image classification, medical scans, OCR. **RNNs / LSTMs** process sequences step by step — older approach for text, speech and time series. **Transformers** use self-attention to look at all tokens at once — the foundation of BERT, GPT and modern LLMs, and now also vision (ViT).\n\n**Use deep learning** for unstructured data (images, audio, text, video), very large datasets, and transfer learning from pre-trained models. **Prefer classical ML** (gradient boosting, random forests, logistic regression) for small-to-medium tabular data — it is usually more accurate, faster, cheaper and easier to explain.",
    },
    {
      heading: "Keras vs PyTorch",
      content: "**Keras** (part of TensorFlow, and multi-backend since Keras 3) is high-level: define layers with `Sequential`, call `compile()` and `fit()` — very beginner-friendly, popular in production with TensorFlow Serving / TF Lite.\n\n**PyTorch** (Meta) is more 'Pythonic': you define a `nn.Module` class and write the training loop yourself (forward, loss.backward(), optimizer.step()). It dominates research and most new LLM work (Hugging Face Transformers is PyTorch-first).\n\nBoth run on GPUs, support automatic differentiation and have large ecosystems. Neither runs in this browser runner — install them locally (`pip install tensorflow` or `pip install torch`) or use Google Colab with a free GPU.",
    },
    {
      heading: "NLP Basics: Turning Text into Numbers",
      content: "Models need numbers, so text must be **vectorised**. Typical preprocessing: lowercasing, **tokenisation** (splitting into words/subwords), removing **stop words** ('the', 'is', 'and'), and optionally **stemming** (running → run, crude rule-based chopping) or **lemmatisation** (better → good, dictionary-based).\n\n**Bag of Words** (`CountVectorizer`): each document becomes a vector of word counts; word order is lost. **n-grams** keep some order: bigrams like 'not good' carry meaning that 'not' and 'good' alone do not.\n\n**TF-IDF** (`TfidfVectorizer`): weight = term frequency × inverse document frequency. IDF = log((1 + N) / (1 + df)) + 1 in sklearn, where df = number of documents containing the word. Words that appear in every document (like 'the') get low weight; distinctive words get high weight. Rows are L2-normalised.\n\nModern NLP uses **embeddings**: dense vectors (word2vec, GloVe, BERT, sentence-transformers) where similar meanings are close. TF-IDF + linear model remains a strong, fast, explainable baseline.",
      syntax: `from sklearn.feature_extraction.text import TfidfVectorizer
vec = TfidfVectorizer(lowercase=True, stop_words="english", ngram_range=(1, 2),
                      min_df=2, max_df=0.9, sublinear_tf=True)
X = vec.fit_transform(texts)     # sparse matrix (n_docs, n_terms)`,
    },
    {
      heading: "Text Classification Pipeline",
      content: "A production-ready text classifier in sklearn is just a Pipeline: `TfidfVectorizer → LogisticRegression` (or `LinearSVC`, `MultinomialNB`, `SGDClassifier`). Linear models work very well with the huge, sparse feature spaces that TF-IDF creates. Typical uses: sentiment analysis of product reviews, ticket routing, spam detection, intent classification for chatbots, news categorisation.\n\nThe largest coefficients reveal which words push predictions towards each class — easy to explain to stakeholders.",
      tip: "Fit the vectoriser only on training text (the Pipeline does this) — otherwise the vocabulary and IDF values leak information from the test set.",
    },
  ],
  examples: [
    {
      title: "A Neural Network Forward Pass in NumPy",
      scenario: "See exactly what one forward pass of a tiny 2-layer network computes for a single input.",
      steps: [
        "Define input x with 3 features",
        "Hidden layer: 4 neurons with ReLU",
        "Output layer: 3 classes with softmax",
        "Compute cross-entropy loss for the true class",
      ],
      code: `import numpy as np

rng = np.random.default_rng(42)
x = np.array([0.5, -1.2, 2.0])                 # one sample, 3 features

W1, b1 = rng.normal(0, 0.5, (3, 4)), np.zeros(4)   # 3 -> 4
W2, b2 = rng.normal(0, 0.5, (4, 3)), np.zeros(3)   # 4 -> 3

def relu(z):
    return np.maximum(0, z)

def softmax(z):
    e = np.exp(z - z.max())                    # subtract max for numerical stability
    return e / e.sum()

h = relu(x @ W1 + b1)
probs = softmax(h @ W2 + b2)
true_class = 2
loss = -np.log(probs[true_class])

print("Hidden activations:", h.round(3))
print("Output probabilities:", probs.round(3), "sum =", probs.sum().round(3))
print("Predicted class:", probs.argmax(), "| cross-entropy loss:", round(loss, 3))
print("Number of parameters:", W1.size + b1.size + W2.size + b2.size)
`,
      python: { files: { "main.py": `import numpy as np

rng = np.random.default_rng(42)
x = np.array([0.5, -1.2, 2.0])                 # one sample, 3 features

W1, b1 = rng.normal(0, 0.5, (3, 4)), np.zeros(4)   # 3 -> 4
W2, b2 = rng.normal(0, 0.5, (4, 3)), np.zeros(3)   # 4 -> 3

def relu(z):
    return np.maximum(0, z)

def softmax(z):
    e = np.exp(z - z.max())                    # subtract max for numerical stability
    return e / e.sum()

h = relu(x @ W1 + b1)
probs = softmax(h @ W2 + b2)
true_class = 2
loss = -np.log(probs[true_class])

print("Hidden activations:", h.round(3))
print("Output probabilities:", probs.round(3), "sum =", probs.sum().round(3))
print("Predicted class:", probs.argmax(), "| cross-entropy loss:", round(loss, 3))
print("Number of parameters:", W1.size + b1.size + W2.size + b2.size)
` } },
      result: "Hidden activations: [1.23  0.    0.99  1.203]\nOutput probabilities: [0.171 0.652 0.177] sum = 1.0\nPredicted class: 1 | cross-entropy loss: 1.729\nNumber of parameters: 31",
      explanation: "ReLU zeroes out negative hidden values (one of the four neurons here); softmax converts the output scores into probabilities summing to 1. With random weights the network is guessing: it predicts class 1 while the true class is 2, so the cross-entropy loss −log(p₂) is high. Training would compute gradients of this loss for all 31 parameters (3·4 + 4 + 4·3 + 3) via backpropagation and nudge them to reduce it.",
    },
    {
      title: "Training an MLP with scikit-learn",
      scenario: "Classify handwritten digits (8×8 images) with a multi-layer perceptron and compare against logistic regression.",
      steps: [
        "Load the digits dataset (1797 images, 64 pixel features)",
        "Build pipelines with StandardScaler + MLPClassifier and + LogisticRegression",
        "Use early stopping in the MLP",
        "Compare test accuracy and look at the loss curve length",
      ],
      code: `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression

X, y = load_digits(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

mlp = make_pipeline(StandardScaler(),
                    MLPClassifier(hidden_layer_sizes=(128, 64), activation="relu",
                                  solver="adam", alpha=1e-3, learning_rate_init=1e-3,
                                  early_stopping=True, max_iter=300, random_state=42))
mlp.fit(X_tr, y_tr)
logreg = make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000)).fit(X_tr, y_tr)

net = mlp[-1]
print("Layers (in -> hidden -> out):", [w.shape for w in net.coefs_])
print("Epochs run (early stopping):", net.n_iter_)
print("MLP test accuracy   :", round(mlp.score(X_te, y_te), 3))
print("LogReg test accuracy:", round(logreg.score(X_te, y_te), 3))
`,
      python: { files: { "main.py": `from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression

X, y = load_digits(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

mlp = make_pipeline(StandardScaler(),
                    MLPClassifier(hidden_layer_sizes=(128, 64), activation="relu",
                                  solver="adam", alpha=1e-3, learning_rate_init=1e-3,
                                  early_stopping=True, max_iter=300, random_state=42))
mlp.fit(X_tr, y_tr)
logreg = make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000)).fit(X_tr, y_tr)

net = mlp[-1]
print("Layers (in -> hidden -> out):", [w.shape for w in net.coefs_])
print("Epochs run (early stopping):", net.n_iter_)
print("MLP test accuracy   :", round(mlp.score(X_te, y_te), 3))
print("LogReg test accuracy:", round(logreg.score(X_te, y_te), 3))
` } },
      result: "Layers (in -> hidden -> out): [(64, 128), (128, 64), (64, 10)]\nEpochs run (early stopping): 29\nMLP test accuracy   : 0.958\nLogReg test accuracy: 0.978",
      explanation: "The network has 64 inputs → 128 → 64 → 10 outputs. alpha is L2 regularisation; early_stopping holds out 10% of training data and stops when validation accuracy stops improving. On this small, clean dataset the MLP is no better than logistic regression (which even scores slightly higher) — deep learning shines with much more data and raw inputs like full-size images.",
    },
    {
      title: "The Same Network in Keras and PyTorch (Concept Code)",
      scenario: "How the digits MLP looks in the two major deep learning frameworks. TensorFlow and PyTorch do not run in the browser runner, so run this locally or in Google Colab.",
      steps: [
        "pip install tensorflow  (Keras)  or  pip install torch  (PyTorch)",
        "Keras: define Sequential layers, compile with optimiser + loss, call fit",
        "PyTorch: define an nn.Module, write the epoch / batch loop with backward() and step()",
      ],
      code: `# ---------------- Keras (TensorFlow) ----------------
import keras
from keras import layers

model = keras.Sequential([
    keras.Input(shape=(64,)),
    layers.Dense(128, activation="relu"),
    layers.Dropout(0.2),
    layers.Dense(64, activation="relu"),
    layers.Dense(10, activation="softmax"),
])
model.compile(optimizer=keras.optimizers.Adam(1e-3),
              loss="sparse_categorical_crossentropy", metrics=["accuracy"])
model.fit(X_train, y_train, epochs=30, batch_size=32, validation_split=0.1,
          callbacks=[keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)])
print(model.evaluate(X_test, y_test))

# ---------------- PyTorch ----------------
import torch
from torch import nn

class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(64, 128), nn.ReLU(), nn.Dropout(0.2),
                                 nn.Linear(128, 64), nn.ReLU(), nn.Linear(64, 10))
    def forward(self, x):
        return self.net(x)          # raw scores (logits); CrossEntropyLoss applies softmax

torch.manual_seed(42)
model = MLP()
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
loss_fn = nn.CrossEntropyLoss()
Xt = torch.tensor(X_train, dtype=torch.float32)
yt = torch.tensor(y_train, dtype=torch.long)

for epoch in range(30):
    model.train()
    perm = torch.randperm(len(Xt))
    for i in range(0, len(Xt), 32):
        idx = perm[i:i + 32]
        opt.zero_grad()                     # 1. reset gradients
        loss = loss_fn(model(Xt[idx]), yt[idx])   # 2. forward + loss
        loss.backward()                     # 3. backpropagation
        opt.step()                          # 4. update weights

model.eval()
with torch.no_grad():
    preds = model(torch.tensor(X_test, dtype=torch.float32)).argmax(dim=1)
print("accuracy:", (preds.numpy() == y_test).mean())
`,
      result: "Approximately 0.96-0.98 test accuracy for both frameworks on the scaled digits data (X_train / X_test standardised as in the previous example). Exact numbers vary by version and hardware.",
      explanation: "Keras hides the training loop behind fit(); PyTorch makes you write it, which gives more control. Both use the same ideas: Dense/Linear layers, ReLU, dropout, Adam, cross-entropy, mini-batches and epochs. Note that PyTorch's CrossEntropyLoss expects raw logits (it applies log-softmax internally), so there is no softmax layer in the PyTorch model.",
    },
    {
      title: "TF-IDF Step by Step",
      scenario: "See how TF-IDF scores words in three short product reviews and why common words get low weight.",
      steps: [
        "Fit TfidfVectorizer on three documents",
        "Print the vocabulary with IDF values",
        "Show the TF-IDF vector for the first document",
      ],
      code: `import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

docs = [
    "the phone camera is great",
    "the phone battery is bad",
    "great battery and great display",
]
vec = TfidfVectorizer()
X = vec.fit_transform(docs)

idf = pd.Series(vec.idf_, index=vec.get_feature_names_out()).round(3)
print("IDF per word:")
print(idf.sort_values().to_string())
print()
row0 = pd.Series(X[0].toarray().ravel(), index=vec.get_feature_names_out())
print("TF-IDF of doc 0:", row0[row0 > 0].round(3).to_dict())
print("Matrix shape:", X.shape, "| non-zeros:", X.nnz)
`,
      python: { files: { "main.py": `import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

docs = [
    "the phone camera is great",
    "the phone battery is bad",
    "great battery and great display",
]
vec = TfidfVectorizer()
X = vec.fit_transform(docs)

idf = pd.Series(vec.idf_, index=vec.get_feature_names_out()).round(3)
print("IDF per word:")
print(idf.sort_values().to_string())
print()
row0 = pd.Series(X[0].toarray().ravel(), index=vec.get_feature_names_out())
print("TF-IDF of doc 0:", row0[row0 > 0].round(3).to_dict())
print("Matrix shape:", X.shape, "| non-zeros:", X.nnz)
` } },
      result: "IDF per word:\nbattery    1.288\nphone      1.288\nis         1.288\ngreat      1.288\nthe        1.288\ncamera     1.693\nand        1.693\nbad        1.693\ndisplay    1.693\n\nTF-IDF of doc 0: {'camera': 0.549, 'great': 0.418, 'is': 0.418, 'phone': 0.418, 'the': 0.418}\nMatrix shape: (3, 9) | non-zeros: 14",
      explanation: "Words in two of three documents (the, phone, is, great, battery) get a lower IDF than words that appear only once (camera, bad, display, and). In doc 0, 'camera' therefore gets the highest weight — it is what makes this review distinctive. The matrix is sparse: only the non-zero entries are stored, which is why TF-IDF scales to millions of documents.",
    },
    {
      title: "Sentiment Classifier with TF-IDF + Logistic Regression",
      scenario: "Build a review sentiment model (positive / negative) for an e-commerce site and explain which words drive predictions.",
      steps: [
        "Create a small labelled review dataset",
        "Pipeline: TfidfVectorizer(ngram_range=(1, 2)) → LogisticRegression",
        "Predict new reviews, including one with negation",
        "Print the most positive and most negative terms",
      ],
      code: `import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

reviews = [
    "excellent product fast delivery", "very good quality loved it",
    "great value for money", "awesome phone superb camera",
    "good battery life happy with purchase", "amazing quality highly recommend",
    "worst product waste of money", "very bad quality broke in a week",
    "poor battery not good", "terrible service late delivery",
    "not worth the price disappointed", "defective item bad experience",
]
labels = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]   # 1 = positive

clf = make_pipeline(TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True),
                    LogisticRegression(C=10, max_iter=1000))
clf.fit(reviews, labels)

tests = ["superb quality and fast delivery", "bad camera waste of money", "not good"]
for t, p in zip(tests, clf.predict_proba(tests)[:, 1]):
    print(f"P(positive)={p:.2f}  <- {t}")

vec, lr = clf[0], clf[-1]
terms = vec.get_feature_names_out()
order = np.argsort(lr.coef_[0])
print("Most negative terms:", list(terms[order[:5]]))
print("Most positive terms:", list(terms[order[-5:]][::-1]))
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

reviews = [
    "excellent product fast delivery", "very good quality loved it",
    "great value for money", "awesome phone superb camera",
    "good battery life happy with purchase", "amazing quality highly recommend",
    "worst product waste of money", "very bad quality broke in a week",
    "poor battery not good", "terrible service late delivery",
    "not worth the price disappointed", "defective item bad experience",
]
labels = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]   # 1 = positive

clf = make_pipeline(TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True),
                    LogisticRegression(C=10, max_iter=1000))
clf.fit(reviews, labels)

tests = ["superb quality and fast delivery", "bad camera waste of money", "not good"]
for t, p in zip(tests, clf.predict_proba(tests)[:, 1]):
    print(f"P(positive)={p:.2f}  <- {t}")

vec, lr = clf[0], clf[-1]
terms = vec.get_feature_names_out()
order = np.argsort(lr.coef_[0])
print("Most negative terms:", list(terms[order[:5]]))
print("Most positive terms:", list(terms[order[-5:]][::-1]))
` } },
      result: "P(positive)=0.77  <- superb quality and fast delivery\nP(positive)=0.25  <- bad camera waste of money\nP(positive)=0.29  <- not good\nMost negative terms: ['not', 'bad', 'not good', 'battery not', 'poor battery']\nMost positive terms: ['excellent', 'fast delivery', 'fast', 'excellent product', 'product fast']",
      explanation: "TF-IDF with unigrams and bigrams feeds a logistic regression. Each term gets a coefficient: positive words push towards class 1, negative words towards 0, which makes the model explainable. Bigrams such as 'not good' let the model learn simple negation that single words miss. With real data (thousands of reviews) this baseline often reaches 85-90% accuracy; transformer models like BERT do better on subtle language but are far heavier.",
    },
  ],
  interview: [
    { q: "What is an activation function and why do we need non-linear activations?", a: "An activation function transforms a neuron's weighted sum into its output. Without non-linear activations, a network of any depth is equivalent to a single linear transformation, so it could only learn linear relationships. Non-linear functions like ReLU, sigmoid and tanh let the network approximate complex, non-linear functions.", level: "Easy" },
    { q: "Explain backpropagation in simple terms.", a: "After a forward pass computes the loss, backpropagation applies the chain rule to compute how much each weight contributed to the loss — the gradient — starting from the output layer and moving backwards, reusing intermediate results. An optimiser such as SGD or Adam then updates each weight in the direction that reduces the loss.", level: "Medium" },
    { q: "What are epochs, batch size and learning rate?", a: "An epoch is one full pass over the training data. Batch size is the number of samples processed before each weight update (mini-batch gradient descent). Learning rate is the step size for weight updates. Larger batches give smoother but less frequent updates; too high a learning rate diverges, too low trains slowly.", level: "Easy" },
    { q: "What is the vanishing gradient problem and how is it addressed?", a: "In deep networks with sigmoid or tanh activations, gradients are multiplied by small derivatives at each layer during backprop, so they shrink exponentially and early layers barely learn. Solutions: ReLU-family activations, careful weight initialisation (He/Xavier), batch normalisation, residual (skip) connections, and LSTM/GRU gates for sequences.", level: "Medium" },
    { q: "What is dropout?", a: "A regularisation technique where, during training, each neuron's output is set to zero with probability p (e.g. 0.2-0.5) at every step. This prevents neurons from co-adapting and acts like training an ensemble of thinned networks. At inference dropout is turned off (activations are scaled appropriately).", level: "Medium" },
    { q: "Softmax vs sigmoid in the output layer?", a: "Sigmoid outputs an independent probability for each output, used for binary classification or multi-label problems where several labels can be true. Softmax outputs a probability distribution over mutually exclusive classes that sums to 1, used for multi-class classification.", level: "Easy" },
    { q: "When would you choose gradient boosting over a neural network?", a: "For small-to-medium structured/tabular data, gradient boosting (XGBoost, LightGBM, CatBoost) usually matches or beats neural networks while being faster to train, needing less tuning and preprocessing, and being easier to interpret. Neural networks are preferred for unstructured data (images, audio, text), very large datasets, or when transfer learning from pre-trained models is possible.", level: "Medium" },
    { q: "Keras vs PyTorch — what are the main differences?", a: "Keras offers a high-level API (Sequential/Functional models with compile and fit), quick to prototype and integrated with the TensorFlow deployment stack. PyTorch uses define-by-run eager execution with explicit training loops, offering flexibility and easy debugging; it dominates research and the Hugging Face ecosystem. Both support GPUs and autograd; Keras 3 can even run on a PyTorch or JAX backend.", level: "Medium" },
    { q: "What is TF-IDF?", a: "Term Frequency-Inverse Document Frequency weights a word by how often it occurs in a document (TF) multiplied by how rare it is across all documents (IDF ≈ log(N/df)). Common words like 'the' get low weight and distinctive words get high weight. Each document becomes a sparse vector used as features for models like logistic regression or SVM.", level: "Easy" },
    { q: "Stemming vs lemmatisation?", a: "Stemming chops word endings with heuristic rules (Porter stemmer: 'studies' → 'studi'), fast but may produce non-words. Lemmatisation uses vocabulary and morphology to return the dictionary form ('studies' → 'study', 'better' → 'good'), more accurate but slower and needs part-of-speech information. With TF-IDF they reduce vocabulary size; transformer models usually skip both and use subword tokenisers.", level: "Medium" },
    { q: "What are the limitations of bag-of-words / TF-IDF?", a: "They ignore word order (beyond n-grams) and context, cannot capture semantic similarity ('good' and 'great' are unrelated dimensions), create very high-dimensional sparse vectors, and cannot handle out-of-vocabulary words. Word embeddings and transformer models (BERT, sentence-transformers) address these by learning dense, contextual representations.", level: "Medium" },
    { q: "How would you build a text classifier for 50,000 customer support tickets into 10 categories?", a: "Start with a baseline: clean text, TfidfVectorizer with unigrams+bigrams, min_df, sublinear_tf, then LogisticRegression or LinearSVC with class_weight='balanced'; evaluate with stratified CV and macro-F1 plus a confusion matrix. Then try sentence-transformer embeddings + logistic regression or fine-tune a small transformer (DistilBERT) if the baseline is insufficient. Add monitoring for new categories and drift, and a human-review loop for low-confidence predictions.", level: "Hard" },
  ],
  practice: [
    {
      task: "Count the parameters of a dense network with 20 inputs, hidden layers of 64 and 32 neurons, and 3 outputs.",
      hint: "Each layer has (inputs × outputs) weights + outputs biases.",
      solution: "Layer 1: 20 × 64 + 64 = 1,344\nLayer 2: 64 × 32 + 32 = 2,080\nLayer 3: 32 × 3 + 3 = 99\nTotal = 3,523 trainable parameters.",
    },
    {
      task: "Train MLPClassifier on load_breast_cancer with and without StandardScaler (hidden_layer_sizes=(32,), max_iter=1000, random_state=42). Compare test accuracy and explain the difference.",
      hint: "Use make_pipeline for the scaled version.",
      solution: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier

X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
raw = MLPClassifier(hidden_layer_sizes=(32,), max_iter=1000, random_state=42).fit(X_tr, y_tr)
scaled = make_pipeline(StandardScaler(),
                       MLPClassifier(hidden_layer_sizes=(32,), max_iter=1000, random_state=42)).fit(X_tr, y_tr)
print("raw   :", round(raw.score(X_te, y_te), 3))
print("scaled:", round(scaled.score(X_te, y_te), 3))
# raw ~0.63 vs scaled ~0.965. Unscaled features (area in the 1000s vs smoothness ~0.1)
# make gradients badly conditioned, so gradient descent struggles.`,
    },
    {
      task: "Write a function that computes TF-IDF for the word 'battery' in document 1 of the Example 4 corpus manually, using sklearn's smooth IDF formula idf = ln((1 + N) / (1 + df)) + 1, then L2-normalise against the full row. Verify against TfidfVectorizer.",
      hint: "Doc 1 = 'the phone battery is bad': 5 distinct words, each TF = 1. Compute idf for each, then divide 'battery' by the L2 norm of the row.",
      solution: `import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

docs = ["the phone camera is great", "the phone battery is bad", "great battery and great display"]
N = len(docs)
def idf(word):
    df = sum(word in d.split() for d in docs)
    return np.log((1 + N) / (1 + df)) + 1

words = "the phone battery is bad".split()
raw = np.array([idf(w) for w in words])          # tf = 1 for each word
manual = raw[words.index("battery")] / np.linalg.norm(raw)

vec = TfidfVectorizer().fit(docs)
auto = vec.transform([docs[1]])[0, vec.vocabulary_["battery"]]
print(round(manual, 4), round(auto, 4))          # both 0.4178`,
    },
    {
      task: "Extend the sentiment example: evaluate the TF-IDF + LogisticRegression pipeline on the 12 reviews with 4-fold StratifiedKFold cross-validation and compare ngram_range=(1, 1) vs (1, 2).",
      hint: "cross_val_score(pipe, reviews, labels, cv=StratifiedKFold(4, shuffle=True, random_state=42)).",
      solution: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score, StratifiedKFold

reviews = ["excellent product fast delivery", "very good quality loved it", "great value for money",
           "awesome phone superb camera", "good battery life happy with purchase",
           "amazing quality highly recommend", "worst product waste of money",
           "very bad quality broke in a week", "poor battery not good", "terrible service late delivery",
           "not worth the price disappointed", "defective item bad experience"]
labels = [1] * 6 + [0] * 6
cv = StratifiedKFold(4, shuffle=True, random_state=42)
for ng in [(1, 1), (1, 2)]:
    pipe = make_pipeline(TfidfVectorizer(ngram_range=ng), LogisticRegression(C=10, max_iter=1000))
    print(ng, cross_val_score(pipe, reviews, labels, cv=cv).mean())
# With only 12 tiny reviews, CV accuracy is only ~0.33 for both settings — no better than
# chance: most words in each test fold were never seen in training. The lesson: text models need far more data — or pre-trained embeddings.`,
    },
  ],
  quiz: [
    { question: "Which activation is the default choice for hidden layers in modern networks?", options: ["Sigmoid", "ReLU", "Softmax", "Linear"], answer: 1, explanation: "ReLU is cheap and mitigates vanishing gradients." },
    { question: "Backpropagation computes:", options: ["Predictions", "Gradients of the loss with respect to weights using the chain rule", "The learning rate", "The number of layers"], answer: 1, explanation: "Backprop efficiently computes all gradients; the optimiser then updates weights." },
    { question: "One epoch means:", options: ["One weight update", "One pass over the whole training set", "One batch", "One layer"], answer: 1, explanation: "An epoch is a full pass through all training samples." },
    { question: "In TF-IDF, a word that appears in every document gets:", options: ["Very high weight", "Low weight", "Weight equal to its count", "Removed automatically"], answer: 1, explanation: "Its inverse document frequency is minimal, so its weight is low." },
    { question: "For small tabular datasets, the strongest default choice is usually:", options: ["A deep CNN", "Gradient-boosted trees", "An RNN", "A transformer"], answer: 1, explanation: "Gradient boosting typically beats neural networks on small-to-medium tabular data." },
    { question: "In PyTorch, which call computes the gradients?", options: ["optimizer.step()", "loss.backward()", "model.eval()", "optimizer.zero_grad()"], answer: 1, explanation: "loss.backward() runs backpropagation; optimizer.step() then updates the weights." },
  ],
};
