export default {
  id: "day-37-regression-scikit-learn",
  title: "Regression with scikit-learn: Linear Regression, Train/Test Split, MAE and RMSE",
  module: "Module 6: Machine Learning Hands-on",
  day: 37,
  level: "Beginner",
  duration: "2 hours",
  summary: "Train your first real ML model. Regression predicts a number (price, marks, sales, temperature). Learn the scikit-learn workflow (import, create, fit, predict, evaluate), how linear regression draws the best-fit line, why we split data into training and test sets, and how to judge a regression model with MAE, MSE, RMSE and R-squared. Run every example in the in-app Python IDE and see the line being fitted in the ML Playground.",
  objectives: [
    "Explain what regression is and give real-world examples",
    "Describe how linear regression finds the best-fit line (slope, intercept, least squares)",
    "Use the scikit-learn workflow: train_test_split, fit, predict, score",
    "Calculate and interpret MAE, MSE, RMSE and R-squared",
    "Build a multi-feature regression and read its coefficients"
  ],
  theory: [
    {
      heading: "What is Regression?",
      content: "Regression is supervised learning where the answer (target) is a continuous number. You give the model examples of inputs with known numeric outputs; it learns the relationship and predicts numbers for new inputs. Analogy: a property agent who has seen hundreds of flats can estimate a new flat's price from its size, location and floor - that is regression in the head.",
      points: [
        "House price from size and location; sales next month from ad spend; delivery time from distance; exam marks from study hours; electricity demand from temperature.",
        "Classification (Day 38) predicts a category (spam / not spam). Regression predicts an amount.",
        "Common regression models: Linear Regression, Polynomial Regression, Decision Tree Regressor, Random Forest Regressor, Gradient Boosting (XGBoost, LightGBM), neural networks."
      ]
    },
    {
      heading: "Linear Regression: The Best-Fit Line",
      content: "Linear regression assumes the target changes in a straight-line way with the input: y = m * x + c. m (slope / coefficient) is how much y changes when x increases by 1; c (intercept) is the value of y when x = 0. With several features: y = w1*x1 + w2*x2 + ... + b. The model chooses m and c that make the total squared error between predicted and actual values as small as possible - this is called Ordinary Least Squares.",
      syntax: `slope m  = sum((x - mean_x) * (y - mean_y)) / sum((x - mean_x) ** 2)
intercept c = mean_y - m * mean_x
prediction  = m * x_new + c`,
      points: [
        "Error (residual) for one row = actual - predicted. We square it so negatives do not cancel positives and big mistakes count more.",
        "Interpretation: slope 6.94 for marks vs hours means 'each extra hour of study is linked to about 6.9 more marks' in this data.",
        "Correlation is not causation: the model finds a pattern, it does not prove that x causes y.",
        "Try it visually: open the ML Playground (/tools/ml-playground), choose Linear Regression, click to add points and watch the line move to the best fit."
      ]
    },
    {
      heading: "The scikit-learn Workflow (Same for Every Model)",
      content: "scikit-learn gives every model the same simple interface, so once you learn it for linear regression you can use it for 50+ other models. It is like every car having the same steering, brake and accelerator.",
      syntax: `from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = LinearRegression()        # 1. create
model.fit(X_train, y_train)       # 2. train (learn coef_ and intercept_)
y_pred = model.predict(X_test)    # 3. predict
print(mean_absolute_error(y_test, y_pred))   # 4. evaluate
print(model.coef_, model.intercept_)`,
      points: [
        "fit = learning from data; predict = using what was learned (training vs inference from Day 2).",
        "Attributes that end with an underscore (coef_, intercept_) exist only after fit.",
        "model.score(X_test, y_test) returns R-squared for regressors.",
        "Swap LinearRegression for DecisionTreeRegressor or RandomForestRegressor - the rest of the code stays the same."
      ]
    },
    {
      heading: "Train/Test Split: Do Not Grade the Student on the Practice Paper",
      content: "If you test a model on the same rows it learned from, it can look perfect just by memorising. So we hide part of the data (test set, typically 20-30%) during training and use it only for the final check. Analogy: a teacher gives practice questions (training) and a different final exam (test). Only the final exam shows real understanding.",
      syntax: `# random shuffle, 20% test, repeatable
train_test_split(X, y, test_size=0.2, random_state=42)
# no shuffle - last 25% becomes the test set (useful for time-ordered data)
train_test_split(X, y, test_size=0.25, shuffle=False)`,
      points: [
        "random_state fixes the shuffle so you (and your teammates) get the same split every time.",
        "For time series (sales by month), never shuffle: train on the past, test on the future.",
        "A three-way split (train / validation / test) is used when you also tune settings - see cross-validation on Day 40.",
        "Small datasets give noisy test scores - one unusual test row can change the result a lot."
      ]
    },
    {
      heading: "Regression Metrics: MAE, MSE, RMSE and R-squared",
      content: "Metrics turn 'how good is the model?' into a number. All of them compare y_test (actual) with y_pred (predicted).",
      syntax: `MAE  = average of |actual - predicted|                  (same unit as y)
MSE  = average of (actual - predicted) ** 2             (squared unit)
RMSE = square root of MSE                               (same unit as y, punishes big errors)
R2   = 1 - sum((actual - pred) ** 2) / sum((actual - mean_actual) ** 2)`,
      points: [
        "MAE 1.77 marks = 'on average we are wrong by about 1.8 marks'. Easy to explain to managers.",
        "RMSE >= MAE always. If RMSE is much larger than MAE, a few predictions are badly wrong.",
        "R-squared: 1.0 = perfect, 0 = no better than always predicting the average, negative = worse than the average.",
        "Lower is better for MAE/MSE/RMSE; higher is better for R-squared.",
        "Always compare against a baseline: 'predict the average for everyone'. A useful model must beat it."
      ],
      tip: "In scikit-learn, RMSE = np.sqrt(mean_squared_error(y_test, y_pred)). Newer versions also have root_mean_squared_error."
    },
    {
      heading: "Multiple Features, Assumptions and Pitfalls",
      content: "Real problems use many features: price from size, rooms, floor and location. Each feature gets its own coefficient. Linear regression is simple, fast and explainable, but it has limits.",
      points: [
        "Each coefficient = change in y for +1 of that feature while the other features stay the same.",
        "Features on different scales give coefficients that are hard to compare - standardise first if you want to compare importance.",
        "Outliers pull the line strongly (because errors are squared).",
        "Curved relationships need polynomial features or non-linear models (trees, forests).",
        "Highly correlated features (multicollinearity) make individual coefficients unstable, though predictions can still be fine.",
        "Extrapolation is risky: predicting for 20 study hours when training only had 1-8 hours assumes the line continues forever."
      ]
    }
  ],
  examples: [
    {
      title: "Predict Exam Marks from Study Hours",
      scenario: "You have 8 students' study hours and marks. Train a linear regression on the first 6 students and test it on the last 2, then evaluate with MAE, RMSE and R-squared.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Compare the printed slope, intercept and metrics with the Result",
        "Open the ML Playground (/tools/ml-playground), choose Linear Regression and click the same 8 points to see the line",
        "Change one mark (e.g. 74 to 90) and run again - watch MAE and RMSE change"
      ],
      code: `import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

X = np.array([[1], [2], [3], [4], [5], [6], [7], [8]])   # hours (2-D!)
y = np.array([35, 42, 50, 55, 63, 70, 74, 83])            # marks

# shuffle=False -> first 6 rows train, last 2 rows test (easy to trace)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, shuffle=False)

model = LinearRegression()
model.fit(X_train, y_train)
print("slope:", round(float(model.coef_[0]), 2))
print("intercept:", round(float(model.intercept_), 2))

y_pred = model.predict(X_test)
print("test predictions:", np.round(y_pred, 1).tolist())
print("MAE:", round(mean_absolute_error(y_test, y_pred), 2))
print("RMSE:", round(float(np.sqrt(mean_squared_error(y_test, y_pred))), 2))
print("R2 test:", round(r2_score(y_test, y_pred), 2))
print("predict 10 hours:", round(float(model.predict([[10]])[0]), 1))`,
      python: {
        files: {
          "main.py": `import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

X = np.array([[1], [2], [3], [4], [5], [6], [7], [8]])   # hours (2-D!)
y = np.array([35, 42, 50, 55, 63, 70, 74, 83])            # marks

# shuffle=False -> first 6 rows train, last 2 rows test (easy to trace)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, shuffle=False)

model = LinearRegression()
model.fit(X_train, y_train)
print("slope:", round(float(model.coef_[0]), 2))
print("intercept:", round(float(model.intercept_), 2))

y_pred = model.predict(X_test)
print("test predictions:", np.round(y_pred, 1).tolist())
print("MAE:", round(mean_absolute_error(y_test, y_pred), 2))
print("RMSE:", round(float(np.sqrt(mean_squared_error(y_test, y_pred))), 2))
print("R2 test:", round(r2_score(y_test, y_pred), 2))
print("predict 10 hours:", round(float(model.predict([[10]])[0]), 1))
`
        },
        stdin: ""
      },
      result: `slope: 6.94
intercept: 28.2
test predictions: [76.8, 83.7]
MAE: 1.77
RMSE: 2.05
R2 test: 0.79
predict 10 hours: 97.6`,
      explanation: "Training rows: hours 1-6 (mean 3.5), marks 35-70 (mean 52.5). Slope = 121.5 / 17.5 = 6.94; intercept = 52.5 - 6.94 * 3.5 = 28.2. For 7 hours: 6.94*7 + 28.2 = 76.8 (actual 74, error 2.8). For 8 hours: 83.7 (actual 83, error 0.74). MAE = (2.8 + 0.74)/2 = 1.77. RMSE = sqrt((2.8^2 + 0.74^2)/2) = 2.05 - bigger than MAE because the 2.8 error is squared. R2 = 0.79 on only 2 test rows (noisy, but positive). Predicting 10 hours = 97.6 is extrapolation beyond the training range - treat with caution."
    },
    {
      title: "Multiple Features: Flat Price from Size and Rooms",
      scenario: "Estimate flat prices (in lakhs) from size (hundreds of sq ft) and number of rooms. The demo data follows an exact rule so you can check that the model recovers it: price = 3 * size + 8 * rooms + 12.",
      steps: [
        "Open the Python IDE (/tools/python-ide)",
        "Paste the code and click Run",
        "Read the two coefficients and the intercept",
        "Add some noise to the prices (e.g. 58 -> 60) and run again - coefficients will no longer be perfect"
      ],
      code: `import numpy as np
from sklearn.linear_model import LinearRegression

X = np.array([[10, 2], [12, 3], [15, 3], [18, 4], [20, 4]])   # size, rooms
y = np.array([58, 72, 81, 98, 104])                           # price (lakhs)

model = LinearRegression().fit(X, y)
print("coefficients:", np.round(model.coef_, 2).tolist())
print("intercept:", round(float(model.intercept_), 2))
print("price for size 16, 3 rooms:", round(float(model.predict([[16, 3]])[0]), 1))
print("R2 on training data:", round(model.score(X, y), 2))`,
      python: {
        files: {
          "main.py": `import numpy as np
from sklearn.linear_model import LinearRegression

X = np.array([[10, 2], [12, 3], [15, 3], [18, 4], [20, 4]])   # size, rooms
y = np.array([58, 72, 81, 98, 104])                           # price (lakhs)

model = LinearRegression().fit(X, y)
print("coefficients:", np.round(model.coef_, 2).tolist())
print("intercept:", round(float(model.intercept_), 2))
print("price for size 16, 3 rooms:", round(float(model.predict([[16, 3]])[0]), 1))
print("R2 on training data:", round(model.score(X, y), 2))
`
        },
        stdin: ""
      },
      result: `coefficients: [3.0, 8.0]
intercept: 12.0
price for size 16, 3 rooms: 84.0
R2 on training data: 1.0`,
      explanation: "Because every price follows price = 3*size + 8*rooms + 12 exactly, least squares finds that rule: coefficient 3.0 for size (each extra 100 sq ft adds 3 lakhs, rooms fixed) and 8.0 for rooms (each extra room adds 8 lakhs, size fixed), intercept 12. Prediction: 3*16 + 8*3 + 12 = 84. R2 = 1.0 only because the data is perfect and we scored on training data - real data is never this clean, which is exactly why we use a test set."
    },
    {
      title: "Pure-Python Linear Regression (Runs Anywhere)",
      scenario: "Re-create the study-hours model with only the least-squares formula, to see that scikit-learn is not magic.",
      steps: [
        "Open the Python IDE (/tools/python-ide) or any Python 3",
        "Paste the code and click Run",
        "Check that every number matches the scikit-learn version",
        "Add a ninth student and see how the slope changes"
      ],
      code: `hours = [1, 2, 3, 4, 5, 6, 7, 8]
scores = [35, 42, 50, 55, 63, 70, 74, 83]
xtr, ytr = hours[:6], scores[:6]
xte, yte = hours[6:], scores[6:]
n = len(xtr)
mx = sum(xtr) / n
my = sum(ytr) / n
slope = sum((x - mx) * (y - my) for x, y in zip(xtr, ytr)) / sum((x - mx) ** 2 for x in xtr)
intercept = my - slope * mx
print("slope:", round(slope, 2))
print("intercept:", round(intercept, 2))
preds = [slope * x + intercept for x in xte]
print("test predictions:", [round(p, 1) for p in preds])
errors = [y - p for y, p in zip(yte, preds)]
mae = sum(abs(e) for e in errors) / len(errors)
rmse = (sum(e * e for e in errors) / len(errors)) ** 0.5
mean_te = sum(yte) / len(yte)
r2 = 1 - sum(e * e for e in errors) / sum((y - mean_te) ** 2 for y in yte)
print("MAE:", round(mae, 2))
print("RMSE:", round(rmse, 2))
print("R2 test:", round(r2, 2))
print("predict 10 hours:", round(slope * 10 + intercept, 1))`,
      python: {
        files: {
          "main.py": `hours = [1, 2, 3, 4, 5, 6, 7, 8]
scores = [35, 42, 50, 55, 63, 70, 74, 83]
xtr, ytr = hours[:6], scores[:6]
xte, yte = hours[6:], scores[6:]
n = len(xtr)
mx = sum(xtr) / n
my = sum(ytr) / n
slope = sum((x - mx) * (y - my) for x, y in zip(xtr, ytr)) / sum((x - mx) ** 2 for x in xtr)
intercept = my - slope * mx
print("slope:", round(slope, 2))
print("intercept:", round(intercept, 2))
preds = [slope * x + intercept for x in xte]
print("test predictions:", [round(p, 1) for p in preds])
errors = [y - p for y, p in zip(yte, preds)]
mae = sum(abs(e) for e in errors) / len(errors)
rmse = (sum(e * e for e in errors) / len(errors)) ** 0.5
mean_te = sum(yte) / len(yte)
r2 = 1 - sum(e * e for e in errors) / sum((y - mean_te) ** 2 for y in yte)
print("MAE:", round(mae, 2))
print("RMSE:", round(rmse, 2))
print("R2 test:", round(r2, 2))
print("predict 10 hours:", round(slope * 10 + intercept, 1))
`
        },
        stdin: ""
      },
      result: `slope: 6.94
intercept: 28.2
test predictions: [76.8, 83.7]
MAE: 1.77
RMSE: 2.05
R2 test: 0.79
predict 10 hours: 97.6`,
      explanation: "Identical to scikit-learn because LinearRegression uses the same least-squares idea (with more efficient linear algebra for many features). The formula: slope = covariance(x, y) / variance(x); the intercept makes the line pass through the point (mean_x, mean_y)."
    },
    {
      title: "Ask AI to Explain Your Regression Results to a Manager",
      scenario: "You trained a sales model and must explain it to a non-technical manager. Use AI to turn metrics into plain business language - then check it does not overclaim.",
      steps: [
        "Open the AI Prompt Lab (/tools/ai-lab) or claude.ai / ChatGPT / Gemini",
        "Paste the prompt below (it contains only model outputs, no private data)",
        "Run it and read the explanation",
        "Check: does it wrongly claim that ads CAUSE sales? Does it mention limitations? Edit if needed"
      ],
      code: `Role: You are a data scientist who explains results to non-technical managers.
Context: I trained a linear regression to predict monthly sales (in lakh rupees) from ad spend (lakh rupees) and number of sales staff.
Results on the test set: coefficients: ad_spend = 2.4, staff = 1.1, intercept = 15.0; MAE = 3.2, RMSE = 4.5, R2 = 0.81. Baseline (always predict average) MAE = 9.8. Data: 36 months.
Task: Explain what these numbers mean for the business.
Format: 5 short bullet points + 1 'limitations' bullet.
Constraints: plain English, no formulas, do not claim causation, mention that 36 months is a small dataset.`,
      prompt: {
        system: "You are a data scientist who explains machine learning results to non-technical managers in plain, honest English. You never overclaim and you always mention limitations.",
        user: "I trained a linear regression to predict monthly sales (in lakh rupees) from ad spend (lakh rupees) and number of sales staff.\nResults on the test set: coefficients: ad_spend = 2.4, staff = 1.1, intercept = 15.0; MAE = 3.2, RMSE = 4.5, R2 = 0.81. Baseline (always predict average) MAE = 9.8. Data: 36 months.\nTask: Explain what these numbers mean for the business.\nFormat: 5 short bullet points + 1 'limitations' bullet.\nConstraints: plain English, no formulas, do not claim causation, mention that 36 months is a small dataset."
      },
      result: "Bullets like: 'Months with 1 lakh more ad spend had about 2.4 lakh more sales, keeping staff the same'; 'Each extra staff member is linked to about 1.1 lakh more sales'; 'Typical prediction error is about 3.2 lakh, much better than the 9.8 lakh of simply guessing the average'; 'The model explains roughly 80% of the month-to-month variation'; 'RMSE above MAE means a few months were missed by more'; Limitations: association not causation, only 36 months, seasonality and other factors not included.",
      explanation: "Communicating results is a core data-science skill. AI helps draft the wording quickly, but you must verify it is accurate - especially that it says 'linked to' rather than 'causes', and that it compares with the baseline."
    }
  ],
  tools: [
    { name: "In-app Python IDE", use: "Run scikit-learn regression code in the browser", url: "/tools/python-ide" },
    { name: "ML Playground", use: "Click points and watch linear regression fit the best line", url: "/tools/ml-playground" },
    { name: "scikit-learn", use: "LinearRegression, train_test_split and metrics", url: "https://scikit-learn.org" },
    { name: "Google Colab", use: "Free notebooks to train models on bigger datasets", url: "https://colab.research.google.com" }
  ],
  interview: [
    { q: "What is the difference between regression and classification?", a: "Regression predicts a continuous number (price, temperature); classification predicts a category (spam/not spam, cat/dog). Metrics differ: MAE/RMSE/R2 for regression, accuracy/precision/recall/F1 for classification.", level: "Easy" },
    { q: "How does linear regression find the best line?", a: "It chooses the coefficients and intercept that minimise the sum of squared residuals (Ordinary Least Squares). This can be solved with a closed-form formula (normal equation) or with gradient descent for very large data.", level: "Medium" },
    { q: "Why do we split data into training and test sets?", a: "To estimate how the model performs on unseen data. Evaluating on training data rewards memorisation (overfitting) and gives an over-optimistic score.", level: "Easy" },
    { q: "MAE vs RMSE - which would you report and why?", a: "MAE is easier to explain (average error in the same unit) and robust to outliers. RMSE penalises large errors more, so use it when big mistakes are especially costly. Reporting both is common; a large gap between them signals a few large errors.", level: "Medium" },
    { q: "What does an R-squared of 0.8 mean? Can R-squared be negative?", a: "About 80% of the variance in the target is explained by the model compared with predicting the mean. On a test set R2 can be negative, meaning the model is worse than always predicting the average.", level: "Medium" },
    { q: "How do you interpret a coefficient in multiple linear regression?", a: "It is the expected change in the target for a one-unit increase in that feature, holding all other features constant. It shows association, not causation.", level: "Medium" },
    { q: "What is random_state in train_test_split?", a: "A seed for the random shuffle so the same split is produced every time, making results reproducible and comparable.", level: "Easy" },
    { q: "What are the main assumptions/limitations of linear regression?", a: "Linear relationship, independent errors, roughly constant error variance, no extreme multicollinearity, and sensitivity to outliers. It cannot capture curves without feature engineering and extrapolation beyond the training range is unreliable.", level: "Hard" },
    { q: "Why must X be 2-D in scikit-learn even with one feature?", a: "scikit-learn always expects (n_samples, n_features). A 1-D array is ambiguous (many samples of one feature or one sample of many features), so reshape(-1, 1) or use double brackets.", level: "Easy" },
    { q: "When would you not shuffle before splitting?", a: "For time-ordered data (sales, stock prices, sensor readings). Shuffling would let the model see the future during training. Train on earlier periods and test on later ones (or use TimeSeriesSplit).", level: "Hard" }
  ],
  practice: [
    {
      task: "Using the study-hours example, change test_size to 0.5 (still shuffle=False). Predict what happens to the slope before running, then run and compare.",
      hint: "The model will train only on hours 1-4 (marks 35, 42, 50, 55).",
      solution: "With hours 1-4: mean x = 2.5, mean y = 45.5, Sxy = (-1.5*-10.5)+(-0.5*-3.5)+(0.5*4.5)+(1.5*9.5) = 15.75+1.75+2.25+14.25 = 34, Sxx = 5, slope = 6.8, intercept = 45.5 - 17 = 28.5. Fewer training rows means a less reliable model; check the new MAE on hours 5-8."
    },
    {
      task: "Write a function baseline_mae(y_train, y_test) that always predicts the training mean, and compare its MAE with the linear model on the study-hours data.",
      hint: "Training mean = 52.5. Test actuals = 74 and 83.",
      solution: `def baseline_mae(y_train, y_test):
    m = sum(y_train) / len(y_train)
    return sum(abs(y - m) for y in y_test) / len(y_test)
print(baseline_mae([35, 42, 50, 55, 63, 70], [74, 83]))  # 26.0  vs model MAE 1.77`
    },
    {
      task: "Open the ML Playground (/tools/ml-playground), choose Linear Regression, add 10 points roughly on a line, then add one far-away outlier. Describe how the line changes.",
      hint: "Squared errors make one outlier pull the line strongly towards itself.",
      solution: "The line tilts towards the outlier because its squared error dominates the total. This shows why you must inspect outliers before training and why MAE-based or robust models (e.g. HuberRegressor) are sometimes preferred."
    },
    {
      task: "Train a RandomForestRegressor(random_state=0) on the flat-price data and compare its prediction for [16, 3] with linear regression. Explain the difference.",
      hint: "Replace LinearRegression with RandomForestRegressor from sklearn.ensemble; keep fit/predict the same.",
      solution: "The forest gives a value between the nearby training prices (it averages tree leaves) instead of the exact 84.0, because trees cannot extrapolate a perfect linear rule from 5 rows. The lesson: the scikit-learn API is the same, but model behaviour differs; linear models suit linear patterns."
    },
    {
      task: "Use an AI assistant to generate a 30-row synthetic dataset (CSV) of 'delivery distance (km)' and 'delivery time (minutes)' with some noise. Load it with Pandas, train linear regression with train_test_split(test_size=0.2, random_state=42) and report MAE and RMSE.",
      hint: "Ask: 'Generate 30 rows CSV distance_km,time_min where time is about 10 + 3*distance with random noise of +-5'. Paste into pd.read_csv(io.StringIO(text)).",
      solution: "Expect a slope near 3 and intercept near 10, with MAE of a few minutes. Exact numbers depend on the generated noise. Report: 'Each extra km adds about 3 minutes; typical error about X minutes.'"
    }
  ],
  quiz: [
    {
      question: "Which of these is a regression problem?",
      options: ["Is this email spam?", "Which digit is in this image?", "What will the house sell for?", "Which customer group does this user belong to?"],
      answer: 2,
      explanation: "Price is a continuous number, so it is regression. The others are classification or clustering."
    },
    {
      question: "Actual values [10, 20], predictions [12, 17]. What is the MAE?",
      options: ["2.5", "5", "6.5", "3"],
      answer: 0,
      explanation: "Absolute errors are 2 and 3; their average is 2.5."
    },
    {
      question: "Why is RMSE usually larger than MAE?",
      options: ["RMSE uses a different test set", "RMSE squares errors, so large errors count more", "RMSE adds the intercept", "MAE ignores negative errors"],
      answer: 1,
      explanation: "Squaring gives extra weight to large errors before averaging and taking the square root."
    },
    {
      question: "What does model.fit(X_train, y_train) do?",
      options: ["Predicts y for new data", "Splits the data", "Calculates MAE", "Learns the coefficients and intercept from training data"],
      answer: 3,
      explanation: "fit is the training step; predict is the inference step."
    },
    {
      question: "A model has R2 = -0.3 on the test set. What does this mean?",
      options: ["It performs worse than always predicting the average", "It is 30% accurate", "It is perfect", "It is impossible - R2 is always between 0 and 1"],
      answer: 0,
      explanation: "On unseen data R2 can be negative, meaning the model is worse than the simple mean baseline."
    }
  ]
};
