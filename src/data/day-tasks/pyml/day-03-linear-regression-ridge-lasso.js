export default {
  lesson: 'day-03-linear-regression-ridge-lasso',
  minutes: 35,
  intro: 'Fit simple and multiple linear regression, interpret coefficients, compute MAE / MSE / RMSE / R² by hand and with sklearn, and compare Ridge and Lasso.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A salary model is `salary = 25000 + 4200 × experience_years`. What does **4200** mean?',
      options: ['The salary of a fresher', 'Each extra year of experience adds ₹4200 to the predicted salary', 'The error of the model', 'The R² of the model'],
      answer: 1,
      explain: '4200 is the **slope (coefficient)**: the change in prediction for +1 unit of the feature, keeping other features fixed. 25000 is the **intercept**, the prediction when experience = 0.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about regression metrics are TRUE? (choose all that apply)',
      options: ['MAE is in the same unit as the target (₹) and less sensitive to outliers than MSE', 'RMSE = square root of MSE, so it is in the target\'s unit again', 'R² = 1 means perfect predictions; R² = 0 means no better than predicting the mean', 'A higher MSE is better', 'R² can be negative on test data if the model is worse than predicting the mean'],
      answers: [0, 1, 2, 4],
      explain: 'For error metrics (MAE, MSE, RMSE) **lower is better**. MSE squares errors, so big mistakes dominate. R² compares the model with a "predict the average" baseline and can drop below 0 for a bad model on new data.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Metrics by hand.** Write `metrics(y_true, y_pred)` that returns a dict with `"mae"`, `"mse"`, `"rmse"` and `"r2"`, each rounded to 3 decimals. Use NumPy formulas (do not import sklearn.metrics):\n- MAE = mean(|y − ŷ|), MSE = mean((y − ŷ)²), RMSE = √MSE\n- R² = 1 − SS_res / SS_tot with SS_tot = Σ(y − mean(y))²',
      example: { title: 'vectorised error', code: 'err = np.array(y_true) - np.array(y_pred)\nnp.mean(np.abs(err))' },
      starter: 'import numpy as np\n\ndef metrics(y_true, y_pred):\n    # TODO\n    return {}\n',
      solution: 'import numpy as np\n\ndef metrics(y_true, y_pred):\n    y = np.array(y_true, dtype=float)\n    p = np.array(y_pred, dtype=float)\n    err = y - p\n    mse = np.mean(err ** 2)\n    r2 = 1 - np.sum(err ** 2) / np.sum((y - y.mean()) ** 2)\n    return {"mae": round(float(np.mean(np.abs(err))), 3), "mse": round(float(mse), 3),\n            "rmse": round(float(np.sqrt(mse)), 3), "r2": round(float(r2), 3)}\n',
      tests: [
        { call: 'metrics([3, 5, 7, 10], [2.5, 5.5, 7.5, 8.2])', expect: { mae: 0.825, mse: 0.998, rmse: 0.999, r2: 0.851 } },
        { call: 'metrics([10, 20, 30], [12, 18, 33])["r2"]', expect: 0.915 },
      ],
      explain: 'MAE averages absolute errors; MSE squares them (so the 1.8 miss on the last value dominates); RMSE brings the unit back. R² = 1 − (model error) / (error of always predicting the mean). sklearn gives the same numbers with `mean_absolute_error`, `mean_squared_error` and `r2_score`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Simple linear regression.** Fit `model = LinearRegression()` on experience (years) → salary (₹ thousands). Then set:\n1. `slope`, `intercept`: rounded to 2 decimals\n2. `pred_6`: predicted salary for 6 years of experience, rounded to 1 decimal\n3. `r2`: R² on the same data (`model.score`), rounded to 3 decimals',
      example: { title: 'LinearRegression', code: 'from sklearn.linear_model import LinearRegression\nm = LinearRegression().fit(X, y)      # X must be 2D: [[1], [2], ...]\nm.coef_[0], m.intercept_\nm.predict([[10]])' },
      starter: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\nX = np.array([[1], [2], [3], [4], [5], [7], [8]])\ny = np.array([28, 33, 37, 44, 47, 59, 64])\n\n# TODO\n',
      solution: 'import numpy as np\nfrom sklearn.linear_model import LinearRegression\nX = np.array([[1], [2], [3], [4], [5], [7], [8]])\ny = np.array([28, 33, 37, 44, 47, 59, 64])\n\nmodel = LinearRegression().fit(X, y)\nslope = round(float(model.coef_[0]), 2)\nintercept = round(float(model.intercept_), 2)\npred_6 = round(float(model.predict([[6]])[0]), 1)\nr2 = round(model.score(X, y), 3)\n',
      tests: [
        { call: '[round(float(slope), 2), round(float(intercept), 2)]', expect: [5.17, 22.41] },
        { call: 'round(float(pred_6), 1)', expect: 53.4 },
        { call: 'round(float(r2), 3)', expect: 0.996 },
      ],
      explain: 'sklearn needs X as a **2D** array (rows × features) – passing `[1, 2, 3]` raises "Expected 2D array". The fitted line minimises the sum of squared errors (OLS); the slope says how much salary rises per extra year.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Ridge vs Lasso.** On the diabetes dataset (`load_diabetes(return_X_y=True)`), fit three models on all data:\n- `lin = LinearRegression()`\n- `ridge = Ridge(alpha=1.0)`\n- `lasso = Lasso(alpha=1.0)`\n\nThen set `zero_lasso` = how many Lasso coefficients are **exactly 0**, `zero_ridge` = the same for Ridge, and `shrunk` = `True` if the sum of absolute Ridge coefficients is smaller than that of LinearRegression.',
      example: { title: 'regularised models', code: 'from sklearn.linear_model import Ridge, Lasso\nr = Ridge(alpha=10).fit(X, y)\nint((r.coef_ == 0).sum())\nnp.abs(r.coef_).sum()' },
      starter: 'import numpy as np\nfrom sklearn.datasets import load_diabetes\nfrom sklearn.linear_model import LinearRegression, Ridge, Lasso\nX, y = load_diabetes(return_X_y=True)\n\n# TODO\n',
      solution: 'import numpy as np\nfrom sklearn.datasets import load_diabetes\nfrom sklearn.linear_model import LinearRegression, Ridge, Lasso\nX, y = load_diabetes(return_X_y=True)\n\nlin = LinearRegression().fit(X, y)\nridge = Ridge(alpha=1.0).fit(X, y)\nlasso = Lasso(alpha=1.0).fit(X, y)\nzero_lasso = int((lasso.coef_ == 0).sum())\nzero_ridge = int((ridge.coef_ == 0).sum())\nshrunk = bool(np.abs(ridge.coef_).sum() < np.abs(lin.coef_).sum())\n',
      tests: [
        { call: 'int(zero_lasso)', expect: 7, msg: 'Lasso(alpha=1.0) sets 7 of the 10 diabetes coefficients to exactly 0' },
        { call: 'int(zero_ridge)', expect: 0 },
        { call: 'bool(shrunk)', expect: true },
      ],
      explain: 'Both add a penalty on coefficient size. **Ridge (L2)** shrinks all coefficients towards 0 but rarely to exactly 0. **Lasso (L1)** can set coefficients **exactly** to 0, so it also performs feature selection. A larger `alpha` = stronger penalty = simpler model.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this print? (a perfect straight line)',
      code: `from sklearn.linear_model import LinearRegression
X = [[1], [2], [3], [4]]
y = [7, 9, 11, 13]
m = LinearRegression().fit(X, y)
print(round(m.coef_[0], 2), round(m.intercept_, 2))
print(round(m.predict([[10]])[0], 1))
print(m.score(X, y))`,
      expected: '2.0 5.0\n25.0\n1.0',
      explain: 'y = 5 + 2x fits these points exactly, so the slope is 2, the intercept 5, the prediction for x = 10 is 25 and R² = 1.0 (perfect). Real data never fits perfectly – an R² of exactly 1.0 on real data usually means the target leaked into the features.',
    },
  ],
};
