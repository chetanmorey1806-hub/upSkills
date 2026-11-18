export default {
  id: "day-12-end-to-end-ml-project-deployment-interview-prep",
  title: "End-to-End ML Project: Train, Evaluate, Save with joblib, Serve with FastAPI / Streamlit + ML Interview Preparation",
  module: "Module 4: Deep Learning & Project",
  day: 12,
  level: "Advanced",
  duration: "4 hours",
  summary: "Put everything together: build a customer-churn model from raw data to a deployed prediction service. Train and tune a full Pipeline, evaluate it honestly, save it with joblib, serve it through a FastAPI endpoint and a Streamlit app, monitor it for drift — and prepare to explain the whole project confidently in ML interviews.",
  objectives: [
    "Structure an ML project from problem definition to deployment",
    "Build, tune and evaluate a complete preprocessing + model Pipeline",
    "Save and load models with joblib and version them safely",
    "Serve predictions with a FastAPI REST endpoint and a Streamlit UI",
    "Monitor data drift and present an ML project in interviews using a clear structure",
  ],
  theory: [
    {
      heading: "Project Structure and Problem Framing",
      content: "A telecom company loses customers every month. **Business goal**: reduce churn by offering retention discounts to customers likely to leave. **ML task**: binary classification — predict P(churn in the next 30 days). **Metric**: since offers cost money, we care about precision and recall of churners; we will optimise ROC-AUC for ranking and choose a threshold based on campaign budget. **Baseline**: 'no model' (everyone gets the offer, or nobody does).\n\nA clean repository layout makes the project reproducible and impressive on GitHub:",
      syntax: `churn-project/
├── data/                 # raw/ and processed/ (not committed if large or private)
├── notebooks/            # EDA only
├── src/
│   ├── features.py       # feature engineering functions
│   ├── train.py          # builds pipeline, tunes, evaluates, saves model
│   └── predict.py        # loads model, predicts
├── models/churn_model_v1.joblib
├── app/api.py            # FastAPI service
├── app/streamlit_app.py  # demo UI
├── tests/                # unit tests for features and API
├── requirements.txt
└── README.md             # problem, data, approach, results, how to run`,
    },
    {
      heading: "Training and Evaluation Checklist",
      content: "Follow the same steps you learned across this course, in this order:",
      points: [
        "Hold out a final test set first (stratified; or time-based if data is temporal)",
        "EDA on training data only: target rate, missing values, distributions, leakage suspects",
        "Pipeline: ColumnTransformer (impute + scale numeric, impute + one-hot categorical) → model",
        "Compare a few model families with cross-validation (LogReg baseline, RandomForest, HistGradientBoosting)",
        "Tune the best one with RandomizedSearchCV / GridSearchCV on the Pipeline",
        "Evaluate once on the test set: ROC-AUC, PR-AUC, confusion matrix at the chosen threshold, classification report",
        "Explain: permutation importance or SHAP; check performance across segments (city, plan) for fairness",
        "Save the whole fitted Pipeline + metadata (version, date, features, metrics, sklearn version)",
      ],
    },
    {
      heading: "Saving Models with joblib",
      content: "`joblib.dump(pipeline, 'model.joblib')` serialises the fitted Pipeline — preprocessing and model together — to disk; `joblib.load` restores it. joblib is preferred over plain pickle for objects containing large NumPy arrays (more efficient, supports compression).\n\nImportant caveats: (1) load the model with the **same scikit-learn version** used to save it — record it in metadata or requirements.txt; (2) **never load joblib/pickle files from untrusted sources** — unpickling can execute arbitrary code; (3) for cross-language, portable deployment consider **ONNX** (skl2onnx) or **skops** (a safer sklearn persistence format).",
      syntax: `import joblib
joblib.dump({"model": pipe, "threshold": 0.35, "version": "v1"}, "models/churn_v1.joblib", compress=3)
bundle = joblib.load("models/churn_v1.joblib")
bundle["model"].predict_proba(new_df)[:, 1]`,
    },
    {
      heading: "Serving: FastAPI and Streamlit",
      content: "**FastAPI** builds a REST API: other systems (a CRM, a mobile app) send customer data as JSON and receive a churn probability. It uses **Pydantic** models to validate input automatically, generates interactive docs at `/docs` (Swagger UI), and is fast (ASGI, run with `uvicorn`). Load the model **once at startup**, not on every request.\n\n**Streamlit** turns a Python script into an interactive web app with sliders, dropdowns and charts — perfect for demos to business users and for your portfolio. Deploy free on Streamlit Community Cloud or Hugging Face Spaces.\n\nFor production: containerise with **Docker**, deploy to a cloud service (AWS ECS/SageMaker, GCP Cloud Run, Azure ML), add logging, authentication, health checks (`/health`) and CI/CD.",
    },
    {
      heading: "Monitoring, Drift and Retraining (MLOps Basics)",
      content: "Models decay. **Data drift**: input distributions change (new pricing plans, younger customers). **Concept drift**: the relationship between inputs and target changes (a competitor launches a cheap plan, so the same customers now churn more). Monitor:\n\n• Input feature distributions vs training — Population Stability Index (PSI), KS test. Rule of thumb: PSI < 0.1 stable, 0.1-0.25 moderate shift, > 0.25 major shift.\n• Prediction distribution (average predicted churn).\n• Actual performance once labels arrive (churn is known 30 days later).\n\nRetrain on a schedule or when drift/performance alerts fire. Track experiments and model versions with tools like **MLflow** or Weights & Biases.",
    },
    {
      heading: "How to Present an ML Project in Interviews",
      content: "Interviewers for ML engineer / data scientist roles in India (product companies, startups, service companies' AI practices) almost always ask: 'Walk me through a project.' Use a **STAR + metrics** structure and be ready for follow-ups on every choice.",
      points: [
        "Situation & goal: business problem, who uses the output, success metric",
        "Data: sources, size, target definition, class balance, main cleaning issues, leakage you avoided",
        "Approach: baseline → models tried → why the final model; key features you engineered",
        "Evaluation: CV strategy, test metrics (with numbers), threshold choice tied to business cost",
        "Deployment: how it is served (API/batch), latency, monitoring, retraining",
        "Impact & learnings: e.g. 'retention campaign precision improved from 20% to 45%'; what you would do next",
        "Revise core theory: bias-variance, regularisation, metrics, tree ensembles, CV, leakage, imbalance — every earlier day of this course",
      ],
      tip: "Never claim numbers you cannot explain. Saying 'I chose PR-AUC because only 8% of customers churn' shows more maturity than quoting 99% accuracy.",
    },
  ],
  examples: [
    {
      title: "Step 1-2: Build Data, Compare Models with Cross-Validation",
      scenario: "Create a realistic synthetic telecom churn dataset with mixed column types and missing values, then compare three model families inside the same preprocessing Pipeline.",
      steps: [
        "Generate the dataset with NumPy/pandas (stand-in for the company database)",
        "Hold out a stratified 20% test set",
        "Define a ColumnTransformer for numeric and categorical columns",
        "Compare LogisticRegression, RandomForest and HistGradientBoosting with 5-fold CV ROC-AUC",
      ],
      code: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier

def make_churn_data(n=3000, seed=42):
    rng = np.random.default_rng(seed)
    df = pd.DataFrame({
        "tenure_months": rng.integers(1, 72, n),
        "monthly_charges": rng.normal(650, 200, n).clip(199, 1500).round(),
        "data_gb_used": rng.gamma(2.0, 8.0, n).round(1),
        "support_calls": rng.poisson(1.2, n),
        "contract": rng.choice(["monthly", "one_year", "two_year"], n, p=[0.55, 0.25, 0.20]),
        "payment": rng.choice(["upi", "card", "cash"], n, p=[0.5, 0.3, 0.2]),
        "city_tier": rng.choice(["tier1", "tier2", "tier3"], n),
    })
    z = (-1.2 - 0.04 * df.tenure_months + 0.003 * (df.monthly_charges - 650)
         + 0.45 * df.support_calls + 1.3 * (df.contract == "monthly")
         - 0.8 * (df.contract == "two_year") + 0.4 * (df.payment == "cash"))
    df["churn"] = (rng.random(n) < 1 / (1 + np.exp(-z))).astype(int)
    df.loc[rng.choice(n, 150, replace=False), "monthly_charges"] = np.nan
    df.loc[rng.choice(n, 100, replace=False), "payment"] = np.nan
    return df

df = make_churn_data()
X, y = df.drop(columns="churn"), df["churn"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
print("Rows:", len(df), "| churn rate:", round(y.mean(), 3))

num = ["tenure_months", "monthly_charges", "data_gb_used", "support_calls"]
cat = ["contract", "payment", "city_tier"]
pre = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num),
    ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                      ("oh", OneHotEncoder(handle_unknown="ignore"))]), cat),
])
models = {
    "LogReg": LogisticRegression(max_iter=1000),
    "RandomForest": RandomForestClassifier(n_estimators=300, min_samples_leaf=5, random_state=42, n_jobs=-1),
    "HistGB": HistGradientBoostingClassifier(random_state=42),
}
cv = StratifiedKFold(5, shuffle=True, random_state=42)
for name, m in models.items():
    s = cross_val_score(Pipeline([("pre", pre), ("clf", m)]), X_tr, y_tr, cv=cv, scoring="roc_auc")
    print(f"{name:12s} CV ROC-AUC = {s.mean():.3f} ± {s.std():.3f}")
`,
      python: { files: { "main.py": `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier

def make_churn_data(n=3000, seed=42):
    rng = np.random.default_rng(seed)
    df = pd.DataFrame({
        "tenure_months": rng.integers(1, 72, n),
        "monthly_charges": rng.normal(650, 200, n).clip(199, 1500).round(),
        "data_gb_used": rng.gamma(2.0, 8.0, n).round(1),
        "support_calls": rng.poisson(1.2, n),
        "contract": rng.choice(["monthly", "one_year", "two_year"], n, p=[0.55, 0.25, 0.20]),
        "payment": rng.choice(["upi", "card", "cash"], n, p=[0.5, 0.3, 0.2]),
        "city_tier": rng.choice(["tier1", "tier2", "tier3"], n),
    })
    z = (-1.2 - 0.04 * df.tenure_months + 0.003 * (df.monthly_charges - 650)
         + 0.45 * df.support_calls + 1.3 * (df.contract == "monthly")
         - 0.8 * (df.contract == "two_year") + 0.4 * (df.payment == "cash"))
    df["churn"] = (rng.random(n) < 1 / (1 + np.exp(-z))).astype(int)
    df.loc[rng.choice(n, 150, replace=False), "monthly_charges"] = np.nan
    df.loc[rng.choice(n, 100, replace=False), "payment"] = np.nan
    return df

df = make_churn_data()
X, y = df.drop(columns="churn"), df["churn"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
print("Rows:", len(df), "| churn rate:", round(y.mean(), 3))

num = ["tenure_months", "monthly_charges", "data_gb_used", "support_calls"]
cat = ["contract", "payment", "city_tier"]
pre = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num),
    ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                      ("oh", OneHotEncoder(handle_unknown="ignore"))]), cat),
])
models = {
    "LogReg": LogisticRegression(max_iter=1000),
    "RandomForest": RandomForestClassifier(n_estimators=300, min_samples_leaf=5, random_state=42, n_jobs=-1),
    "HistGB": HistGradientBoostingClassifier(random_state=42),
}
cv = StratifiedKFold(5, shuffle=True, random_state=42)
for name, m in models.items():
    s = cross_val_score(Pipeline([("pre", pre), ("clf", m)]), X_tr, y_tr, cv=cv, scoring="roc_auc")
    print(f"{name:12s} CV ROC-AUC = {s.mean():.3f} ± {s.std():.3f}")
` } },
      result: "Rows: 3000 | churn rate: 0.245\nLogReg       CV ROC-AUC = 0.806 ± 0.024\nRandomForest CV ROC-AUC = 0.785 ± 0.022\nHistGB       CV ROC-AUC = 0.750 ± 0.023",
      explanation: "Every model shares the identical preprocessing Pipeline, so the comparison is fair and leak-free. Because the true churn process here is linear in log-odds, logistic regression actually wins (≈0.81 vs 0.79 and 0.75 ROC-AUC) — a common real-world finding on modest tabular data and a great talking point: 'I picked the simpler, explainable model because the boosted model did not add meaningful lift.'",
    },
    {
      title: "Step 3-4: Tune, Evaluate on Test, Choose Threshold, Save with joblib",
      scenario: "Tune the logistic regression, evaluate once on the untouched test set, pick a threshold that fits the retention budget (contact the top ~30% riskiest customers), and save the bundle.",
      steps: [
        "Re-create the data and pipeline (same seed → same data)",
        "GridSearchCV over C on the training data",
        "Report test ROC-AUC, PR-AUC and the confusion matrix at the chosen threshold",
        "Save model + threshold + metadata with joblib, reload and predict for a new customer",
      ],
      code: `import json
import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, average_precision_score, confusion_matrix, precision_score, recall_score

def make_churn_data(n=3000, seed=42):
    rng = np.random.default_rng(seed)
    df = pd.DataFrame({
        "tenure_months": rng.integers(1, 72, n),
        "monthly_charges": rng.normal(650, 200, n).clip(199, 1500).round(),
        "data_gb_used": rng.gamma(2.0, 8.0, n).round(1),
        "support_calls": rng.poisson(1.2, n),
        "contract": rng.choice(["monthly", "one_year", "two_year"], n, p=[0.55, 0.25, 0.20]),
        "payment": rng.choice(["upi", "card", "cash"], n, p=[0.5, 0.3, 0.2]),
        "city_tier": rng.choice(["tier1", "tier2", "tier3"], n),
    })
    z = (-1.2 - 0.04 * df.tenure_months + 0.003 * (df.monthly_charges - 650)
         + 0.45 * df.support_calls + 1.3 * (df.contract == "monthly")
         - 0.8 * (df.contract == "two_year") + 0.4 * (df.payment == "cash"))
    df["churn"] = (rng.random(n) < 1 / (1 + np.exp(-z))).astype(int)
    df.loc[rng.choice(n, 150, replace=False), "monthly_charges"] = np.nan
    df.loc[rng.choice(n, 100, replace=False), "payment"] = np.nan
    return df

df = make_churn_data()
X, y = df.drop(columns="churn"), df["churn"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
num = ["tenure_months", "monthly_charges", "data_gb_used", "support_calls"]
cat = ["contract", "payment", "city_tier"]
pre = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num),
    ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                      ("oh", OneHotEncoder(handle_unknown="ignore"))]), cat),
])
pipe = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=1000))])
search = GridSearchCV(pipe, {"clf__C": [0.01, 0.1, 1, 10]}, cv=5, scoring="roc_auc").fit(X_tr, y_tr)
model = search.best_estimator_
print("Best C:", search.best_params_["clf__C"], "| CV ROC-AUC:", round(search.best_score_, 3))

# threshold from TRAINING predictions: flag the riskiest ~30% of customers
threshold = float(np.quantile(model.predict_proba(X_tr)[:, 1], 0.70))
proba = model.predict_proba(X_te)[:, 1]
pred = (proba >= threshold).astype(int)
print("Test ROC-AUC:", round(roc_auc_score(y_te, proba), 3),
      "| PR-AUC:", round(average_precision_score(y_te, proba), 3))
print("Threshold:", round(threshold, 3), "| flagged:", pred.sum(), "of", len(pred))
print("Precision:", round(precision_score(y_te, pred), 3), "| Recall:", round(recall_score(y_te, pred), 3))
print("Confusion matrix:", confusion_matrix(y_te, pred).tolist())

bundle = {"model": model, "threshold": threshold, "version": "churn-v1",
          "features": num + cat, "sklearn_version": sklearn.__version__}
joblib.dump(bundle, "churn_v1.joblib", compress=3)

loaded = joblib.load("churn_v1.joblib")
customer = pd.DataFrame([{"tenure_months": 3, "monthly_charges": 899, "data_gb_used": 4.0,
                          "support_calls": 4, "contract": "monthly", "payment": "cash",
                          "city_tier": "tier2"}])
p = loaded["model"].predict_proba(customer)[0, 1]
print(json.dumps({"version": loaded["version"], "churn_probability": round(float(p), 3),
                  "offer_retention_discount": bool(p >= loaded["threshold"])}))
`,
      python: { files: { "main.py": `import json
import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, average_precision_score, confusion_matrix, precision_score, recall_score

def make_churn_data(n=3000, seed=42):
    rng = np.random.default_rng(seed)
    df = pd.DataFrame({
        "tenure_months": rng.integers(1, 72, n),
        "monthly_charges": rng.normal(650, 200, n).clip(199, 1500).round(),
        "data_gb_used": rng.gamma(2.0, 8.0, n).round(1),
        "support_calls": rng.poisson(1.2, n),
        "contract": rng.choice(["monthly", "one_year", "two_year"], n, p=[0.55, 0.25, 0.20]),
        "payment": rng.choice(["upi", "card", "cash"], n, p=[0.5, 0.3, 0.2]),
        "city_tier": rng.choice(["tier1", "tier2", "tier3"], n),
    })
    z = (-1.2 - 0.04 * df.tenure_months + 0.003 * (df.monthly_charges - 650)
         + 0.45 * df.support_calls + 1.3 * (df.contract == "monthly")
         - 0.8 * (df.contract == "two_year") + 0.4 * (df.payment == "cash"))
    df["churn"] = (rng.random(n) < 1 / (1 + np.exp(-z))).astype(int)
    df.loc[rng.choice(n, 150, replace=False), "monthly_charges"] = np.nan
    df.loc[rng.choice(n, 100, replace=False), "payment"] = np.nan
    return df

df = make_churn_data()
X, y = df.drop(columns="churn"), df["churn"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
num = ["tenure_months", "monthly_charges", "data_gb_used", "support_calls"]
cat = ["contract", "payment", "city_tier"]
pre = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num),
    ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                      ("oh", OneHotEncoder(handle_unknown="ignore"))]), cat),
])
pipe = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=1000))])
search = GridSearchCV(pipe, {"clf__C": [0.01, 0.1, 1, 10]}, cv=5, scoring="roc_auc").fit(X_tr, y_tr)
model = search.best_estimator_
print("Best C:", search.best_params_["clf__C"], "| CV ROC-AUC:", round(search.best_score_, 3))

# threshold from TRAINING predictions: flag the riskiest ~30% of customers
threshold = float(np.quantile(model.predict_proba(X_tr)[:, 1], 0.70))
proba = model.predict_proba(X_te)[:, 1]
pred = (proba >= threshold).astype(int)
print("Test ROC-AUC:", round(roc_auc_score(y_te, proba), 3),
      "| PR-AUC:", round(average_precision_score(y_te, proba), 3))
print("Threshold:", round(threshold, 3), "| flagged:", pred.sum(), "of", len(pred))
print("Precision:", round(precision_score(y_te, pred), 3), "| Recall:", round(recall_score(y_te, pred), 3))
print("Confusion matrix:", confusion_matrix(y_te, pred).tolist())

bundle = {"model": model, "threshold": threshold, "version": "churn-v1",
          "features": num + cat, "sklearn_version": sklearn.__version__}
joblib.dump(bundle, "churn_v1.joblib", compress=3)

loaded = joblib.load("churn_v1.joblib")
customer = pd.DataFrame([{"tenure_months": 3, "monthly_charges": 899, "data_gb_used": 4.0,
                          "support_calls": 4, "contract": "monthly", "payment": "cash",
                          "city_tier": "tier2"}])
p = loaded["model"].predict_proba(customer)[0, 1]
print(json.dumps({"version": loaded["version"], "churn_probability": round(float(p), 3),
                  "offer_retention_discount": bool(p >= loaded["threshold"])}))
` } },
      result: "Best C: 1 | CV ROC-AUC: 0.808\nTest ROC-AUC: 0.824 | PR-AUC: 0.626\nThreshold: 0.321 | flagged: 187 of 600\nPrecision: 0.503 | Recall: 0.639\nConfusion matrix: [[360, 93], [53, 94]]\n{\"version\": \"churn-v1\", \"churn_probability\": 0.943, \"offer_retention_discount\": true}",
      explanation: "The threshold is derived from the business constraint (budget to contact ~30% of customers) using training data, not the test set. The test set is used once for the final report. The saved bundle stores the whole Pipeline plus the threshold, version and sklearn version, so the API can reproduce decisions exactly. A new customer with 3 months' tenure, a monthly contract, cash payment and 4 support calls is very likely to churn and gets the offer.",
    },
    {
      title: "Step 5a: Serve the Model with FastAPI (run locally)",
      scenario: "Expose the saved model as a REST endpoint that the CRM can call. FastAPI and uvicorn run on your machine, not in the browser runner.",
      steps: [
        "pip install fastapi uvicorn scikit-learn pandas joblib",
        "Save the code below as app/api.py next to churn_v1.joblib",
        "Run: uvicorn app.api:app --reload",
        "Open http://127.0.0.1:8000/docs and try POST /predict",
      ],
      code: `# app/api.py
from typing import Literal, Optional
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field

bundle = joblib.load("churn_v1.joblib")          # load ONCE at startup
model, threshold = bundle["model"], bundle["threshold"]

app = FastAPI(title="Churn Prediction API", version=bundle["version"])

class Customer(BaseModel):
    tenure_months: int = Field(ge=0, le=120)
    monthly_charges: Optional[float] = Field(default=None, ge=0)
    data_gb_used: float = Field(ge=0)
    support_calls: int = Field(ge=0)
    contract: Literal["monthly", "one_year", "two_year"]
    payment: Optional[Literal["upi", "card", "cash"]] = None
    city_tier: Literal["tier1", "tier2", "tier3"]

@app.get("/health")
def health():
    return {"status": "ok", "model_version": bundle["version"]}

@app.post("/predict")
def predict(customer: Customer):
    row = pd.DataFrame([customer.model_dump()])
    p = float(model.predict_proba(row)[0, 1])
    return {"churn_probability": round(p, 4),
            "offer_retention_discount": p >= threshold,
            "model_version": bundle["version"]}

# Test from another terminal:
# curl -X POST http://127.0.0.1:8000/predict -H "Content-Type: application/json" \\
#   -d '{"tenure_months":3,"monthly_charges":899,"data_gb_used":4,"support_calls":4,
#        "contract":"monthly","payment":"cash","city_tier":"tier2"}'
`,
      result: "GET /health returns {\"status\": \"ok\", \"model_version\": \"churn-v1\"}. POST /predict with the sample customer returns approximately {\"churn_probability\": 0.9, \"offer_retention_discount\": true, \"model_version\": \"churn-v1\"}. Invalid input (e.g. contract = \"weekly\") is rejected automatically with HTTP 422.",
      explanation: "Pydantic validates every request (types, ranges, allowed values) before the model sees it, and FastAPI generates Swagger docs automatically. Missing values (null monthly_charges or payment) are fine because the Pipeline's imputers handle them. The model is loaded once at import time for low latency. Next production steps: a Dockerfile, logging inputs/outputs for monitoring, authentication and a CI test calling /predict.",
    },
    {
      title: "Step 5b: A Streamlit Demo App (run locally)",
      scenario: "Give the retention team a simple web page to try 'what-if' scenarios for a customer.",
      steps: [
        "pip install streamlit",
        "Save as app/streamlit_app.py",
        "Run: streamlit run app/streamlit_app.py",
        "Move the sliders and watch the churn probability update",
      ],
      code: `# app/streamlit_app.py
import joblib
import pandas as pd
import streamlit as st

@st.cache_resource            # load the model once and reuse across reruns
def load_bundle():
    return joblib.load("churn_v1.joblib")

bundle = load_bundle()
st.title("Customer Churn Predictor")
st.caption(f"Model version: {bundle['version']}")

col1, col2 = st.columns(2)
with col1:
    tenure = st.slider("Tenure (months)", 1, 72, 12)
    charges = st.number_input("Monthly charges (₹)", 199, 1500, 650)
    data_gb = st.slider("Data used (GB / month)", 0.0, 100.0, 15.0)
with col2:
    calls = st.slider("Support calls (last 3 months)", 0, 10, 1)
    contract = st.selectbox("Contract", ["monthly", "one_year", "two_year"])
    payment = st.selectbox("Payment", ["upi", "card", "cash"])
    tier = st.selectbox("City tier", ["tier1", "tier2", "tier3"])

row = pd.DataFrame([{"tenure_months": tenure, "monthly_charges": charges,
                     "data_gb_used": data_gb, "support_calls": calls,
                     "contract": contract, "payment": payment, "city_tier": tier}])
p = bundle["model"].predict_proba(row)[0, 1]
st.metric("Churn probability", f"{p:.1%}")
if p >= bundle["threshold"]:
    st.error("High risk: offer a retention discount")
else:
    st.success("Low risk: no action needed")
`,
      result: "A web page opens at http://localhost:8501 with sliders and dropdowns. For a 1-month, monthly-contract customer with 5 support calls (other inputs at defaults) the metric shows about 90% churn probability and a red 'High risk' banner; switching to a two-year contract with 60 months' tenure drops it to roughly 7-8%, and to about 1% if support calls fall to 1.",
      explanation: "Streamlit reruns the script top to bottom on every widget change; @st.cache_resource keeps the model in memory so it is not reloaded each time. This 40-line app is an excellent portfolio piece: deploy it to Streamlit Community Cloud and put the link on your résumé and GitHub README.",
    },
    {
      title: "Step 6: Monitoring Data Drift with PSI",
      scenario: "Three months after launch, a new cheap plan changes customer behaviour. Detect which features drifted using the Population Stability Index.",
      steps: [
        "Simulate training-time data and a newer production batch where tenure and charges shifted",
        "Implement PSI using training-data quantile bins",
        "Flag features with PSI > 0.25",
      ],
      code: `import numpy as np

def psi(expected, actual, bins=10):
    """Population Stability Index between a reference and a new sample."""
    edges = np.quantile(expected, np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = -np.inf, np.inf
    e = np.histogram(expected, edges)[0] / len(expected)
    a = np.histogram(actual, edges)[0] / len(actual)
    e, a = np.clip(e, 1e-6, None), np.clip(a, 1e-6, None)
    return float(np.sum((a - e) * np.log(a / e)))

rng = np.random.default_rng(42)
train = {
    "tenure_months": rng.integers(1, 72, 5000),
    "monthly_charges": rng.normal(650, 200, 5000),
    "support_calls": rng.poisson(1.2, 5000),
}
prod = {
    "tenure_months": rng.integers(1, 30, 2000),          # many new customers joined
    "monthly_charges": rng.normal(560, 180, 2000),       # cheaper plan launched
    "support_calls": rng.poisson(1.25, 2000),            # about the same
}
for col in train:
    value = psi(train[col], prod[col])
    status = "STABLE" if value < 0.1 else "MODERATE" if value < 0.25 else "MAJOR DRIFT"
    print(f"{col:16s} PSI={value:.3f} -> {status}")
`,
      python: { files: { "main.py": `import numpy as np

def psi(expected, actual, bins=10):
    """Population Stability Index between a reference and a new sample."""
    edges = np.quantile(expected, np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = -np.inf, np.inf
    e = np.histogram(expected, edges)[0] / len(expected)
    a = np.histogram(actual, edges)[0] / len(actual)
    e, a = np.clip(e, 1e-6, None), np.clip(a, 1e-6, None)
    return float(np.sum((a - e) * np.log(a / e)))

rng = np.random.default_rng(42)
train = {
    "tenure_months": rng.integers(1, 72, 5000),
    "monthly_charges": rng.normal(650, 200, 5000),
    "support_calls": rng.poisson(1.2, 5000),
}
prod = {
    "tenure_months": rng.integers(1, 30, 2000),          # many new customers joined
    "monthly_charges": rng.normal(560, 180, 2000),       # cheaper plan launched
    "support_calls": rng.poisson(1.25, 2000),            # about the same
}
for col in train:
    value = psi(train[col], prod[col])
    status = "STABLE" if value < 0.1 else "MODERATE" if value < 0.25 else "MAJOR DRIFT"
    print(f"{col:16s} PSI={value:.3f} -> {status}")
` } },
      result: "tenure_months    PSI=6.365 -> MAJOR DRIFT\nmonthly_charges  PSI=0.198 -> MODERATE\nsupport_calls    PSI=0.003 -> STABLE",
      explanation: "PSI = Σ (actual% − expected%) · ln(actual% / expected%) over bins defined on training data. Tenure shifted massively (many new customers) — its PSI is huge because the upper bins are completely empty in production — monthly charges moderately, and support calls are stable. A drift alert would trigger investigation: check whether model performance dropped once true churn labels arrive, and retrain on recent data if needed.",
    },
  ],
  interview: [
    { q: "Walk me through an end-to-end ML project you have done.", a: "Structure: (1) business problem and metric — e.g. reduce telecom churn, optimise PR-AUC/recall at a budget; (2) data — sources, size, target definition, class balance, cleaning, leakage checks; (3) features — tenure buckets, support-call counts, contract type; (4) modelling — baseline logistic regression, compared RF and gradient boosting with stratified CV; (5) tuning and final test evaluation with numbers; (6) threshold selection by campaign budget; (7) deployment via FastAPI in Docker with monitoring; (8) impact and next steps. Keep it 2-3 minutes and invite follow-ups.", level: "Medium" },
    { q: "How do you save and load a scikit-learn model? What are the risks?", a: "Use joblib.dump(pipeline, 'model.joblib') and joblib.load. Save the entire Pipeline (preprocessing + model) plus metadata. Risks: version incompatibility — load with the same sklearn version; security — pickle/joblib files can execute arbitrary code when loaded, so only load trusted files; consider skops or ONNX for safer/portable formats.", level: "Easy" },
    { q: "Why save the whole Pipeline instead of just the model?", a: "The model expects features transformed exactly as during training — same imputation values, scaling statistics, one-hot categories and column order. Saving only the model forces you to re-implement preprocessing in the serving code, a major source of training-serving skew bugs. The Pipeline guarantees identical transformations.", level: "Medium" },
    { q: "What is training-serving skew?", a: "A mismatch between how features are computed in training and in production — different code paths, different data sources, time-travel leakage in training, or missing values handled differently. It makes a model that looked good offline perform badly online. Prevent it with shared feature code or pipelines, feature stores with point-in-time correctness, and logging production inputs to compare with training data.", level: "Hard" },
    { q: "Batch vs real-time (online) inference — when to use each?", a: "Batch inference scores many records on a schedule (e.g. nightly churn scores for all customers written to a table) — simple, cheap, high throughput, acceptable when predictions are not needed instantly. Real-time inference serves predictions on demand via an API with low latency — needed for fraud checks during payment, recommendations, or chatbots. Many systems combine both.", level: "Medium" },
    { q: "What is data drift vs concept drift and how do you detect them?", a: "Data (covariate) drift: the distribution of input features changes. Concept drift: the relationship between features and target changes. Detect data drift with PSI, KS tests or distribution dashboards on inputs and predictions; detect concept drift by tracking model performance once labels arrive, or with proxy metrics. Respond by investigating, retraining on recent data, or redesigning features.", level: "Medium" },
    { q: "How do you choose a classification threshold for deployment?", a: "Align it with business costs and constraints using validation data: e.g. maximise expected profit (benefit of saving a churner minus cost of the offer), meet a minimum recall, or fit a capacity limit such as 'the team can call 500 customers a week'. Re-evaluate the threshold as base rates drift.", level: "Medium" },
    { q: "How would you deploy a model built with FastAPI to production?", a: "Package the app and model in a Docker image with pinned dependencies; run with uvicorn/gunicorn workers; deploy on a container platform (Kubernetes, AWS ECS, GCP Cloud Run) behind a load balancer; add health checks, authentication, request validation, structured logging and metrics (latency, error rate, prediction distribution); set up CI/CD that runs tests and builds images; version models and support rollback or canary releases.", level: "Hard" },
    { q: "Your model's offline AUC was 0.85 but online performance is much worse. How do you debug?", a: "Check for leakage in training features (future information); training-serving skew (compare logged production features with training features); data drift since training; label definition differences; bugs in the serving pipeline (column order, missing-value handling, version mismatch); and whether the evaluation set was representative (e.g. random split vs time-based reality). Reproduce a few production predictions offline to localise the issue.", level: "Hard" },
    { q: "What is MLOps and which tools are commonly used?", a: "MLOps applies DevOps practices to ML: reproducible pipelines, experiment tracking, model registry and versioning, automated testing, CI/CD for models, deployment, monitoring and retraining. Common tools: MLflow or Weights & Biases (tracking/registry), DVC (data versioning), Airflow/Prefect (orchestration), Docker/Kubernetes, cloud platforms (SageMaker, Vertex AI, Azure ML), Evidently (monitoring), Feast (feature store).", level: "Medium" },
    { q: "How do you explain a model's predictions to non-technical stakeholders?", a: "Global: permutation importance or SHAP summary plots showing which features matter most; partial dependence plots showing how churn risk changes with tenure. Local: SHAP values for a single customer ('high risk mainly because of 4 support calls and monthly contract'). Use plain language, business units and examples, and state limitations and uncertainty.", level: "Medium" },
    { q: "Rapid-fire revision: which algorithm would you try first for (a) small tabular classification, (b) text classification baseline, (c) customer segmentation, (d) images?", a: "(a) Logistic regression baseline, then gradient boosting (HistGradientBoosting/LightGBM/XGBoost) or random forest. (b) TF-IDF + logistic regression or linear SVM (MultinomialNB as a very fast option). (c) Scaled features + K-Means (validate k with silhouette/elbow), DBSCAN for odd shapes, PCA for visualisation. (d) Transfer learning with a pre-trained CNN or vision transformer in PyTorch/Keras.", level: "Easy" },
  ],
  practice: [
    {
      task: "Extend Example 2: add HistGradientBoostingClassifier to a RandomizedSearchCV over learning_rate, max_leaf_nodes and l2_regularization, and compare its test ROC-AUC with the tuned logistic regression. Which would you deploy and why?",
      hint: "Use scipy.stats loguniform for learning_rate and l2_regularization; parameter names use the clf__ prefix.",
      solution: `# after building X_tr, X_te, y_tr, y_te and pre as in Example 2:
from scipy.stats import loguniform, randint
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import RandomizedSearchCV
from sklearn.pipeline import Pipeline
from sklearn.metrics import roc_auc_score

hgb = Pipeline([("pre", pre), ("clf", HistGradientBoostingClassifier(random_state=42))])
dist = {"clf__learning_rate": loguniform(0.01, 0.3),
        "clf__max_leaf_nodes": randint(8, 64),
        "clf__l2_regularization": loguniform(1e-4, 10)}
rs = RandomizedSearchCV(hgb, dist, n_iter=20, cv=5, scoring="roc_auc", random_state=42).fit(X_tr, y_tr)
print("HGB test AUC:", round(roc_auc_score(y_te, rs.predict_proba(X_te)[:, 1]), 3))
# Tuned HGB reaches ~0.80 test AUC vs ~0.82 for logistic regression. Deploy logistic regression:
# better or equal performance, faster, smaller, and its coefficients are easy to explain to the business.`,
    },
    {
      task: "Write a small pytest test file for the FastAPI app that checks /health returns status ok and that /predict rejects contract='weekly' with status 422.",
      hint: "from fastapi.testclient import TestClient; client = TestClient(app).",
      solution: `# tests/test_api.py   (run: pytest -q)
from fastapi.testclient import TestClient
from app.api import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_invalid_contract_rejected():
    payload = {"tenure_months": 3, "monthly_charges": 899, "data_gb_used": 4,
               "support_calls": 4, "contract": "weekly", "payment": "cash", "city_tier": "tier2"}
    assert client.post("/predict", json=payload).status_code == 422

def test_valid_prediction_in_range():
    payload = {"tenure_months": 40, "monthly_charges": 500, "data_gb_used": 20,
               "support_calls": 0, "contract": "two_year", "payment": "upi", "city_tier": "tier1"}
    p = client.post("/predict", json=payload).json()["churn_probability"]
    assert 0.0 <= p <= 1.0`,
    },
    {
      task: "Write a Dockerfile for the FastAPI service (Python 3.12, requirements.txt with pinned versions, model file copied in, port 8000).",
      hint: "Use python:3.12-slim, copy requirements first for layer caching, then the app and model.",
      solution: `# Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ app/
COPY churn_v1.joblib .
EXPOSE 8000
CMD ["uvicorn", "app.api:app", "--host", "0.0.0.0", "--port", "8000"]

# requirements.txt (pin the SAME sklearn version used for training)
# fastapi==0.115.*
# uvicorn==0.30.*
# scikit-learn==1.5.2
# pandas==2.2.*
# joblib==1.4.*

# Build and run:
# docker build -t churn-api:v1 .
# docker run -p 8000:8000 churn-api:v1`,
    },
    {
      task: "Write a 6-8 sentence spoken answer to 'Tell me about your churn project' using the STAR + metrics structure, based on the numbers you got from Examples 1-2.",
      hint: "Situation, Task, Action (data, features, models, evaluation, deployment), Result (metrics + business impact), Learning.",
      solution: "\"A telecom client was losing customers and wanted to target retention offers. I framed it as binary classification of churn in the next 30 days; about a quarter of customers churned, so I focused on ROC-AUC and precision/recall rather than accuracy. I built a scikit-learn Pipeline with median imputation, scaling and one-hot encoding, and compared logistic regression, random forest and gradient boosting with stratified 5-fold CV — logistic regression was actually the best (about 0.81 CV AUC vs 0.79 and 0.75), so I chose it, also for its simplicity and explainability. On the untouched test set it reached about 0.82 ROC-AUC. Because the team could only call around 30% of customers, I set the threshold to flag the top 30% risk scores, which gave about 50% precision — double the 25% base rate — while catching about 64% of churners. I saved the pipeline with joblib, served it through a FastAPI endpoint in Docker with a Streamlit demo, and added PSI-based drift monitoring. Next, I would add usage-trend features and run an A/B test to measure the actual revenue saved.\"",
    },
  ],
  quiz: [
    { question: "What should you save with joblib for deployment?", options: ["Only the model coefficients", "The full fitted Pipeline (preprocessing + model) plus metadata", "The training data", "Only the scaler"], answer: 1, explanation: "Saving the whole Pipeline guarantees identical preprocessing at prediction time." },
    { question: "Why is loading a joblib/pickle file from an unknown source dangerous?", options: ["It is slow", "It can execute arbitrary code", "It deletes the model", "It changes sklearn's version"], answer: 1, explanation: "Unpickling can run arbitrary code, so only load trusted files." },
    { question: "In FastAPI, request validation is handled by:", options: ["joblib", "Pydantic models", "Streamlit", "uvicorn"], answer: 1, explanation: "Pydantic BaseModel classes define and validate the expected JSON schema." },
    { question: "A PSI of 0.40 for a feature indicates:", options: ["Stable distribution", "Moderate shift", "Major drift", "Perfect model"], answer: 2, explanation: "Rule of thumb: PSI > 0.25 is a significant shift worth investigating." },
    { question: "Where should the classification threshold be chosen?", options: ["On the test set", "On training/validation data based on business constraints", "Always 0.5", "Randomly"], answer: 1, explanation: "Choosing on the test set would bias the final evaluation; use validation data and business costs." },
    { question: "Which decorator keeps a model loaded across Streamlit reruns?", options: ["@app.get", "@st.cache_resource", "@staticmethod", "@joblib.memory"], answer: 1, explanation: "st.cache_resource caches heavy resources such as models and DB connections." },
  ],
};
