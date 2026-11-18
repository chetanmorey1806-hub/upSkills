export default {
  id: "day-03-linear-regression-ridge-lasso",
  title: "Linear Regression: Simple & Multiple, MSE / MAE / R², Ridge and Lasso",
  module: "Module 2: Supervised Learning",
  day: 3,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Linear regression is the 'hello world' of ML and the foundation for many advanced models. Learn how it fits a best line by minimising squared error, how to evaluate it with MSE, RMSE, MAE and R², and how Ridge and Lasso regularisation control overfitting and perform feature selection.",
  objectives: [
    "Explain simple and multiple linear regression and interpret coefficients",
    "Describe how ordinary least squares and gradient descent find the best line",
    "Calculate and interpret MSE, RMSE, MAE and R² (and adjusted R²)",
    "State the assumptions of linear regression and how to check them",
    "Use Ridge (L2) and Lasso (L1) regularisation and explain the difference",
  ],
  theory: [
    {
      heading: "Simple Linear Regression: Intuition",
      content: "Imagine plotting years of experience (x) against salary (y) for 50 employees. The points roughly follow an upward line. Simple linear regression finds the straight line `ŷ = b0 + b1·x` that best fits them.\n\n`b1` (slope / coefficient) = how much y changes when x increases by 1. If b1 = 45,000, each extra year of experience adds ₹45,000 to predicted salary. `b0` (intercept) = predicted y when x = 0 (a fresher's salary).\n\n'Best' means the line with the smallest total **squared** error between actual y and predicted ŷ. Squaring makes errors positive and punishes big mistakes more heavily.",
      syntax: `ŷ = b0 + b1·x
residual (error) = y − ŷ
Loss (SSE) = Σ (yᵢ − ŷᵢ)²`,
    },
    {
      heading: "Multiple Linear Regression and How It Is Solved",
      content: "With many features: `ŷ = b0 + b1·x1 + b2·x2 + … + bn·xn`. Each coefficient is the effect of that feature **holding the others constant**.\n\n**Ordinary Least Squares (OLS)** has a closed-form solution, the normal equation `β = (XᵀX)⁻¹ Xᵀy`. sklearn's `LinearRegression` solves it with a stable least-squares routine. For huge datasets we use **gradient descent**: start with random weights, compute the gradient (slope) of the loss, and move the weights a small step (learning rate) in the downhill direction; repeat until the loss stops decreasing. `SGDRegressor` does this.",
      points: [
        "coef_ → array of b1..bn; intercept_ → b0",
        "Coefficients are only comparable in size if features are on the same scale (standardise first)",
        "Linear regression can model curves by adding polynomial features (x², x·z) — it is linear in the coefficients, not necessarily in x",
      ],
    },
    {
      heading: "Regression Metrics: MAE, MSE, RMSE, R²",
      content: "**MAE** (Mean Absolute Error) = average of |y − ŷ|. Easy to explain: 'on average we are off by ₹8,000'. Robust to outliers.\n\n**MSE** (Mean Squared Error) = average of (y − ŷ)². Penalises large errors heavily; unit is squared (rupees²).\n\n**RMSE** = √MSE, back in the original unit. Commonly reported.\n\n**R²** (coefficient of determination) = 1 − SS_res / SS_tot, where SS_tot = Σ(y − ȳ)². It is the fraction of variance in y explained by the model. R² = 1 is perfect; 0 means no better than always predicting the mean; it can be **negative** on test data if the model is worse than the mean.\n\n**Adjusted R²** = 1 − (1 − R²)(n − 1)/(n − p − 1) penalises adding useless features (p = number of features), because plain R² never decreases when you add a feature.",
      tip: "Choose the metric the business cares about. For delivery time, MAE in minutes is intuitive. If big misses are very costly (e.g. under-forecasting inventory), RMSE is better.",
    },
    {
      heading: "Assumptions of Linear Regression",
      content: "Classic OLS inference (p-values, confidence intervals) relies on assumptions. For pure prediction they matter less, but interviewers love them. Remember **LINE**: Linearity, Independence, Normality of residuals, Equal variance (homoscedasticity). Also check multicollinearity.",
      points: [
        "Linearity: relationship between X and y is linear — check residual vs fitted plot for patterns",
        "Independence: errors are not correlated (problem in time series → autocorrelation)",
        "Normality: residuals roughly normally distributed — Q-Q plot",
        "Homoscedasticity: residual spread is constant across predictions (no funnel shape)",
        "No strong multicollinearity: features not highly correlated with each other — check VIF (> 5-10 is a concern)",
      ],
    },
    {
      heading: "Regularisation: Ridge (L2) and Lasso (L1)",
      content: "With many features or correlated features, OLS coefficients can become huge and unstable → overfitting. Regularisation adds a penalty on coefficient size to the loss.\n\n**Ridge**: Loss = SSE + α·Σ b². Shrinks all coefficients towards zero but rarely exactly zero. Great with multicollinearity.\n\n**Lasso**: Loss = SSE + α·Σ |b|. Can shrink some coefficients to **exactly zero**, so it performs automatic **feature selection**.\n\n**ElasticNet** mixes both (l1_ratio). `alpha` controls strength: α = 0 → plain OLS; large α → simpler model (more bias, less variance). The intercept is not penalised. Always **scale features** before regularisation, otherwise the penalty treats features unfairly.",
      syntax: `from sklearn.linear_model import Ridge, Lasso, ElasticNet, RidgeCV, LassoCV
Ridge(alpha=1.0)
Lasso(alpha=0.1)
ElasticNet(alpha=0.1, l1_ratio=0.5)
RidgeCV(alphas=[0.1, 1, 10])     # picks alpha by cross-validation`,
    },
    {
      heading: "Polynomial Regression and When Linear Fails",
      content: "If the true relationship curves (e.g. fuel efficiency vs speed), add powers of features with `PolynomialFeatures(degree=2)`. Degree too high → the curve wiggles through every training point → overfitting. Combine with Ridge to keep it under control.\n\nLinear models are fast, interpretable and a strong baseline. When relationships are highly non-linear with interactions, tree ensembles (Day 6-7) usually win.",
      tip: "In interviews, mention: 'I always start with a linear model as a baseline because it's fast and explainable, then try tree-based models.'",
    },
  ],
  examples: [
    {
      title: "Simple Linear Regression: Experience vs Salary",
      scenario: "An HR team wants to estimate salary (in ₹ lakhs per annum) from years of experience.",
      steps: [
        "Create a small dataset of experience and salary",
        "Fit LinearRegression (X must be 2D: shape (n, 1))",
        "Read slope (coef_) and intercept (intercept_)",
        "Predict salary for 5 and 12 years of experience",
      ],
      code: `import numpy as np
from sklearn.linear_model import LinearRegression

exp = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).reshape(-1, 1)
salary = np.array([3.5, 4.2, 5.1, 5.8, 7.0, 7.4, 8.6, 9.1, 10.2, 10.9])  # LPA

model = LinearRegression().fit(exp, salary)
print("Slope (LPA per year):", round(model.coef_[0], 3))
print("Intercept (LPA):", round(model.intercept_, 3))
print("Predict 5 & 12 years:", model.predict([[5], [12]]).round(2))
print("R2 on training data:", round(model.score(exp, salary), 4))
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.linear_model import LinearRegression

exp = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).reshape(-1, 1)
salary = np.array([3.5, 4.2, 5.1, 5.8, 7.0, 7.4, 8.6, 9.1, 10.2, 10.9])  # LPA

model = LinearRegression().fit(exp, salary)
print("Slope (LPA per year):", round(model.coef_[0], 3))
print("Intercept (LPA):", round(model.intercept_, 3))
print("Predict 5 & 12 years:", model.predict([[5], [12]]).round(2))
print("R2 on training data:", round(model.score(exp, salary), 4))
` } },
      result: "Slope (LPA per year): 0.833\nIntercept (LPA): 2.6\nPredict 5 & 12 years: [ 6.76 12.59]\nR2 on training data: 0.9967",
      explanation: "The slope says each year adds about ₹0.83 lakh to the salary; the intercept is the predicted salary at 0 years. R² close to 1 means a straight line explains almost all variation in this toy data. Predicting 12 years is extrapolation beyond the data range — be careful with that in real life.",
    },
    {
      title: "Computing MAE, MSE, RMSE and R² by Hand and with sklearn",
      scenario: "Verify that you understand each metric by computing it manually with NumPy and comparing with sklearn.metrics.",
      steps: [
        "Define actual and predicted values",
        "Compute each metric with NumPy formulas",
        "Compare with mean_absolute_error, mean_squared_error and r2_score",
      ],
      code: `import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

y = np.array([100, 150, 200, 250, 300])
y_hat = np.array([110, 140, 210, 230, 320])

mae = np.mean(np.abs(y - y_hat))
mse = np.mean((y - y_hat) ** 2)
rmse = np.sqrt(mse)
r2 = 1 - np.sum((y - y_hat) ** 2) / np.sum((y - y.mean()) ** 2)

print("Manual  -> MAE:", mae, "MSE:", mse, "RMSE:", round(rmse, 2), "R2:", round(r2, 4))
print("sklearn -> MAE:", mean_absolute_error(y, y_hat),
      "MSE:", mean_squared_error(y, y_hat),
      "R2:", round(r2_score(y, y_hat), 4))
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

y = np.array([100, 150, 200, 250, 300])
y_hat = np.array([110, 140, 210, 230, 320])

mae = np.mean(np.abs(y - y_hat))
mse = np.mean((y - y_hat) ** 2)
rmse = np.sqrt(mse)
r2 = 1 - np.sum((y - y_hat) ** 2) / np.sum((y - y.mean()) ** 2)

print("Manual  -> MAE:", mae, "MSE:", mse, "RMSE:", round(rmse, 2), "R2:", round(r2, 4))
print("sklearn -> MAE:", mean_absolute_error(y, y_hat),
      "MSE:", mean_squared_error(y, y_hat),
      "R2:", round(r2_score(y, y_hat), 4))
` } },
      result: "Manual  -> MAE: 14.0 MSE: 220.0 RMSE: 14.83 R2: 0.956\nsklearn -> MAE: 14.0 MSE: 220.0 R2: 0.956",
      explanation: "Errors are 10, 10, 10, 20, 20. MAE = 70/5 = 14. MSE = (100+100+100+400+400)/5 = 220, RMSE ≈ 14.83. SS_tot = 25,000, so R² = 1 − 1100/25000 = 0.956. The big misses (20) raise RMSE above MAE — that gap signals some larger errors.",
    },
    {
      title: "Multiple Regression on the Diabetes Dataset",
      scenario: "Predict disease progression from 10 medical features and evaluate on a held-out test set.",
      steps: [
        "Load diabetes as a DataFrame to keep feature names",
        "Split 80/20 and fit LinearRegression",
        "Report MAE, RMSE and R² on the test set",
        "Show the 3 features with the largest absolute coefficients",
      ],
      code: `import numpy as np
import pandas as pd
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

data = load_diabetes(as_frame=True)
X, y = data.data, data.target
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)

lr = LinearRegression().fit(X_tr, y_tr)
pred = lr.predict(X_te)
print("MAE :", round(mean_absolute_error(y_te, pred), 2))
print("RMSE:", round(np.sqrt(mean_squared_error(y_te, pred)), 2))
print("R2  :", round(r2_score(y_te, pred), 3))

coefs = pd.Series(lr.coef_, index=X.columns)
print(coefs.abs().sort_values(ascending=False).head(3).round(1))
`,
      python: { files: { "main.py": `import numpy as np
import pandas as pd
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

data = load_diabetes(as_frame=True)
X, y = data.data, data.target
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)

lr = LinearRegression().fit(X_tr, y_tr)
pred = lr.predict(X_te)
print("MAE :", round(mean_absolute_error(y_te, pred), 2))
print("RMSE:", round(np.sqrt(mean_squared_error(y_te, pred)), 2))
print("R2  :", round(r2_score(y_te, pred), 3))

coefs = pd.Series(lr.coef_, index=X.columns)
print(coefs.abs().sort_values(ascending=False).head(3).round(1))
` } },
      result: "MAE : 42.79\nRMSE: 53.85\nR2  : 0.453\ns1     931.5\ns5     736.2\nbmi    542.4\ndtype: float64",
      explanation: "On average predictions are off by about 42 units, and the model explains ~45% of the variance. Features in this dataset are already mean-centred and scaled, so coefficient sizes are roughly comparable: serum measurement s1, s5 and bmi have the strongest effects. Large opposite-sign coefficients on s1 and s2 hint at multicollinearity (they are correlated).",
    },
    {
      title: "Ridge vs Lasso: Shrinkage and Feature Selection",
      scenario: "With many noisy features, compare how Ridge and Lasso treat coefficients as alpha increases.",
      steps: [
        "Generate data with 20 features where only 5 are informative (make_regression)",
        "Standardise inside a pipeline",
        "Fit LinearRegression, Ridge and Lasso",
        "Count zero coefficients and compare test R²",
      ],
      code: `import numpy as np
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge, Lasso

X, y = make_regression(n_samples=80, n_features=20, n_informative=5,
                       noise=25, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42)

for name, reg in [("OLS", LinearRegression()),
                  ("Ridge a=10", Ridge(alpha=10)),
                  ("Lasso a=5", Lasso(alpha=5))]:
    pipe = make_pipeline(StandardScaler(), reg).fit(X_tr, y_tr)
    coef = pipe[-1].coef_
    print(f"{name:10s} test R2={pipe.score(X_te, y_te):.3f} "
          f"zero coefs={np.sum(np.abs(coef) < 1e-6):2d} "
          f"sum|coef|={np.abs(coef).sum():.0f}")
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge, Lasso

X, y = make_regression(n_samples=80, n_features=20, n_informative=5,
                       noise=25, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42)

for name, reg in [("OLS", LinearRegression()),
                  ("Ridge a=10", Ridge(alpha=10)),
                  ("Lasso a=5", Lasso(alpha=5))]:
    pipe = make_pipeline(StandardScaler(), reg).fit(X_tr, y_tr)
    coef = pipe[-1].coef_
    print(f"{name:10s} test R2={pipe.score(X_te, y_te):.3f} "
          f"zero coefs={np.sum(np.abs(coef) < 1e-6):2d} "
          f"sum|coef|={np.abs(coef).sum():.0f}")
` } },
      result: "OLS        test R2=0.967 zero coefs= 0 sum|coef|=270\nRidge a=10 test R2=0.912 zero coefs= 0 sum|coef|=224\nLasso a=5  test R2=0.963 zero coefs=14 sum|coef|=208",
      explanation: "OLS uses all 20 features, including the 15 pure-noise ones. Ridge shrinks all coefficients (smaller total size) but sets none to zero; with alpha=10 on only 56 training rows it shrinks a bit too much and loses some R². Lasso drives 14 coefficients exactly to zero — automatic feature selection — yet keeps almost the same test R² as OLS with a much simpler, more interpretable model. In practice you would tune alpha with RidgeCV / LassoCV.",
    },
    {
      title: "Polynomial Regression: Underfit vs Good Fit vs Overfit",
      scenario: "A curved relationship (y depends on x²). Compare polynomial degrees 1, 2 and 15 on train and test R².",
      steps: [
        "Generate noisy quadratic data",
        "Build pipelines PolynomialFeatures(degree) → LinearRegression",
        "Compare train vs test R² for each degree",
      ],
      code: `import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(0)
x = rng.uniform(-3, 3, 40).reshape(-1, 1)
y = 0.5 * x.ravel() ** 2 + x.ravel() + 2 + rng.normal(0, 1, 40)
x_tr, x_te, y_tr, y_te = train_test_split(x, y, test_size=0.3, random_state=1)

for d in [1, 2, 15]:
    m = make_pipeline(PolynomialFeatures(d), StandardScaler(), LinearRegression())
    m.fit(x_tr, y_tr)
    print(f"degree={d:2d} train R2={m.score(x_tr, y_tr):.3f} test R2={m.score(x_te, y_te):.3f}")
`,
      python: { files: { "main.py": `import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(0)
x = rng.uniform(-3, 3, 40).reshape(-1, 1)
y = 0.5 * x.ravel() ** 2 + x.ravel() + 2 + rng.normal(0, 1, 40)
x_tr, x_te, y_tr, y_te = train_test_split(x, y, test_size=0.3, random_state=1)

for d in [1, 2, 15]:
    m = make_pipeline(PolynomialFeatures(d), StandardScaler(), LinearRegression())
    m.fit(x_tr, y_tr)
    print(f"degree={d:2d} train R2={m.score(x_tr, y_tr):.3f} test R2={m.score(x_te, y_te):.3f}")
` } },
      result: "degree= 1 train R2=0.535 test R2=0.357\ndegree= 2 train R2=0.834 test R2=0.821\ndegree=15 train R2=0.927 test R2=-175.940",
      explanation: "Degree 1 (a straight line) underfits: both scores are mediocre. Degree 2 matches the true curve and scores well on both. Degree 15 has the best training score but a hugely negative test R² — it memorises noise and wiggles wildly between and beyond the training points. This is the bias-variance trade-off you will study on Day 9.",
    },
  ],
  interview: [
    { q: "What is linear regression and how are its coefficients found?", a: "Linear regression models the target as a weighted sum of features plus an intercept: ŷ = b0 + Σ bᵢxᵢ. Coefficients are found by minimising the sum of squared residuals (Ordinary Least Squares), either with the closed-form normal equation β = (XᵀX)⁻¹Xᵀy or iteratively with gradient descent for large data.", level: "Easy" },
    { q: "Explain MAE, MSE, RMSE and R². When would you prefer each?", a: "MAE is the mean absolute error — interpretable and robust to outliers. MSE is the mean squared error — penalises large errors, differentiable, used as training loss. RMSE = √MSE, same unit as target, sensitive to large errors. R² is the proportion of variance explained (1 − SS_res/SS_tot), unit-free and useful for comparing models on the same data. Prefer MAE when all errors cost the same, RMSE when large errors are especially bad.", level: "Medium" },
    { q: "Can R² be negative?", a: "Yes, on test data. R² = 1 − SS_res/SS_tot. If the model's squared errors are larger than those of simply predicting the mean of y, SS_res > SS_tot and R² becomes negative. On training data with an intercept, OLS R² is between 0 and 1.", level: "Medium" },
    { q: "What is adjusted R² and why is it needed?", a: "Adjusted R² = 1 − (1 − R²)(n − 1)/(n − p − 1). Plain R² never decreases when you add features, even useless ones. Adjusted R² penalises the number of predictors p, increasing only if a new feature improves the model more than expected by chance.", level: "Medium" },
    { q: "What are the assumptions of linear regression?", a: "Linearity between features and target; independence of errors; homoscedasticity (constant error variance); normally distributed residuals (mainly for inference); and no perfect multicollinearity among features. Check with residual plots, Q-Q plots, Durbin-Watson test, and VIF.", level: "Medium" },
    { q: "What is multicollinearity and how do you detect and fix it?", a: "Multicollinearity is when features are highly correlated with each other, making coefficient estimates unstable and hard to interpret (signs may flip). Detect with a correlation matrix or Variance Inflation Factor (VIF > 5-10). Fix by dropping one of the correlated features, combining them, using PCA, or using Ridge regression. It hurts interpretation more than prediction accuracy.", level: "Hard" },
    { q: "Difference between Ridge and Lasso regression?", a: "Both add a penalty to the loss to reduce overfitting. Ridge uses L2 (α·Σb²): shrinks coefficients smoothly but keeps all features; good with correlated features. Lasso uses L1 (α·Σ|b|): can make coefficients exactly zero, performing feature selection; with correlated features it tends to pick one arbitrarily. ElasticNet combines both.", level: "Medium" },
    { q: "Why does L1 regularisation produce sparse solutions but L2 does not?", a: "Geometrically, the L1 constraint region is a diamond with corners on the axes; the elliptical contours of the loss usually touch it at a corner, where some coefficients are exactly zero. The L2 region is a circle with no corners, so the touching point generally has all coefficients non-zero. Analytically, the L1 gradient is constant (±α) no matter how small the weight is, pushing it all the way to zero, whereas the L2 gradient (2αb) becomes tiny near zero.", level: "Hard" },
    { q: "What happens when alpha is very large in Ridge?", a: "The penalty dominates, all coefficients shrink towards zero, and the model predicts close to the mean of y — it underfits (high bias). When alpha is 0, Ridge becomes ordinary least squares. The best alpha is chosen with cross-validation (RidgeCV).", level: "Easy" },
    { q: "Why should you scale features before Ridge/Lasso?", a: "The penalty is applied to coefficient magnitudes. A feature measured in rupees gets a tiny coefficient and a feature measured in lakhs gets a large one, so without scaling the penalty punishes features unequally based on their units rather than their importance. Standardising puts all features on the same footing.", level: "Medium" },
    { q: "Is linear regression sensitive to outliers? What can you do?", a: "Yes. Because errors are squared, a single extreme point can pull the line significantly. Options: investigate/cap outliers, transform the target (log), use robust losses — HuberRegressor, RANSACRegressor, or QuantileRegressor — or use MAE-based evaluation.", level: "Medium" },
    { q: "Linear regression predicts negative house prices for some inputs. How would you handle it?", a: "Model the log of the target (np.log1p(price)) and transform predictions back with expm1, which guarantees positive outputs and often fits skewed prices better. sklearn's TransformedTargetRegressor can wrap this. Alternatively use a model like PoissonRegressor/GammaRegressor or tree ensembles, which do not extrapolate below observed values.", level: "Hard" },
  ],
  practice: [
    {
      task: "Fit a LinearRegression on this data: area_sqft = [600, 800, 1000, 1200, 1500], price_lakh = [30, 40, 48, 60, 74]. Print the slope, intercept and the predicted price for a 1100 sq ft flat.",
      hint: "Reshape area to (-1, 1). predict needs a 2D input like [[1100]].",
      solution: `import numpy as np
from sklearn.linear_model import LinearRegression
area = np.array([600, 800, 1000, 1200, 1500]).reshape(-1, 1)
price = np.array([30, 40, 48, 60, 74])
m = LinearRegression().fit(area, price)
print(m.coef_[0], m.intercept_)      # ~0.0491 lakh per sq ft, intercept ~0.32
print(m.predict([[1100]]))           # ~54.3 lakh`,
    },
    {
      task: "Write a function adjusted_r2(r2, n, p) and use it to compute adjusted R² for the diabetes LinearRegression test result (n = number of test rows, p = 10).",
      hint: "1 - (1 - r2) * (n - 1) / (n - p - 1).",
      solution: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

def adjusted_r2(r2, n, p):
    return 1 - (1 - r2) * (n - 1) / (n - p - 1)

X, y = load_diabetes(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
r2 = LinearRegression().fit(X_tr, y_tr).score(X_te, y_te)
print(round(r2, 3), round(adjusted_r2(r2, len(y_te), X.shape[1]), 3))
# R2 ~0.453, adjusted ~0.382 (lower, because it penalises 10 predictors on only 89 rows)`,
    },
    {
      task: "Use LassoCV (cv=5, random_state=0) inside a pipeline with StandardScaler on the diabetes dataset. Print the chosen alpha and the names of features whose coefficient became zero.",
      hint: "Access the fitted model with pipe[-1]; alpha_ holds the chosen alpha.",
      solution: `import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LassoCV

data = load_diabetes(as_frame=True)
pipe = make_pipeline(StandardScaler(), LassoCV(cv=5, random_state=0)).fit(data.data, data.target)
lasso = pipe[-1]
print("alpha:", round(lasso.alpha_, 3))
print("zeroed:", list(data.data.columns[np.isclose(lasso.coef_, 0)]))
# alpha ~0.079 is chosen and the weak feature s3 drops to zero (the others survive).`,
    },
    {
      task: "Implement simple linear regression with gradient descent in NumPy for x = [1..10], y = 2x + 1 (no noise). Use learning rate 0.01 for 5000 iterations and print the learned w and b.",
      hint: "Gradients of MSE: dw = (-2/n) Σ x(y - ŷ), db = (-2/n) Σ (y - ŷ).",
      solution: `import numpy as np
x = np.arange(1, 11, dtype=float)
y = 2 * x + 1
w, b, lr, n = 0.0, 0.0, 0.01, len(x)
for _ in range(5000):
    y_hat = w * x + b
    dw = (-2 / n) * np.sum(x * (y - y_hat))
    db = (-2 / n) * np.sum(y - y_hat)
    w -= lr * dw
    b -= lr * db
print(round(w, 3), round(b, 3))   # ~2.0 and ~1.0`,
    },
  ],
  quiz: [
    { question: "Which metric is in the same unit as the target and penalises large errors more?", options: ["MAE", "RMSE", "R²", "MSE"], answer: 1, explanation: "RMSE is the square root of MSE, so it is in the original unit, and squaring means large errors weigh more." },
    { question: "R² = 0 on test data means:", options: ["Perfect model", "Model is as good as predicting the mean", "Model is worse than the mean", "Model has no intercept"], answer: 1, explanation: "R² = 1 − SS_res/SS_tot; R² = 0 means SS_res equals the error of always predicting the mean." },
    { question: "Which regularisation can set coefficients exactly to zero?", options: ["Ridge (L2)", "Lasso (L1)", "Neither", "Only OLS"], answer: 1, explanation: "The L1 penalty creates sparse solutions, effectively selecting features." },
    { question: "Increasing alpha in Ridge regression generally:", options: ["Increases variance", "Increases bias and reduces variance", "Removes the intercept", "Makes coefficients larger"], answer: 1, explanation: "Stronger penalty → smaller coefficients → simpler model → more bias, less variance." },
    { question: "A funnel-shaped residual plot indicates a violation of:", options: ["Linearity", "Homoscedasticity", "Independence", "Normality of features"], answer: 1, explanation: "Changing residual spread across fitted values is heteroscedasticity." },
    { question: "Which tool detects multicollinearity?", options: ["R²", "VIF (Variance Inflation Factor)", "MAE", "Confusion matrix"], answer: 1, explanation: "VIF measures how much a coefficient's variance is inflated by correlation with other features." },
  ],
};
