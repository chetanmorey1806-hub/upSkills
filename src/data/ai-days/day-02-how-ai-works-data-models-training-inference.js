const trainingDemo = `# Training vs inference: learn price = w * size + b from data
data = [(1, 3), (2, 5), (3, 7), (4, 9)]   # (size, price)  real rule: 2*size + 1

w, b = 0.0, 0.0          # parameters start at zero
lr = 0.05                # learning rate (step size)

# ---- TRAINING: adjust parameters to reduce error ----
for epoch in range(1, 501):
    dw = db = 0.0
    for x, y in data:
        error = (w * x + b) - y
        dw += 2 * error * x / len(data)
        db += 2 * error / len(data)
    w -= lr * dw
    b -= lr * db
    if epoch in (1, 10, 100, 500):
        loss = sum(((w * x + b) - y) ** 2 for x, y in data) / len(data)
        print(f"epoch {epoch:3}: w={w:.3f} b={b:.3f} loss={loss:.4f}")

# ---- INFERENCE: use the frozen parameters on new input ----
new_size = 10
print("Prediction for size 10:", round(w * new_size + b, 2))
print("Number of parameters in this model:", 2)
`;

export default {
  id: "day-02-how-ai-works-data-models-training-inference",
  title: "How AI Works: Data, Features, Models, Training vs Inference, Parameters",
  module: "Module 1: AI Foundations",
  day: 2,
  level: "Beginner",
  duration: "2 hours",
  summary: "Open the 'black box' of AI: learn how data becomes features, how a model is a function with adjustable knobs (parameters), how training turns those knobs to reduce error, and how inference uses the finished model to make predictions. You will train a 2-parameter model in pure Python and see the same ideas behind models with billions of parameters.",
  objectives: [
    "Explain the role of data, labels and features in an AI system",
    "Describe a model as a function with parameters (weights and biases)",
    "Differentiate training (learning) from inference (using the model)",
    "Understand loss, learning rate and epochs in simple words",
    "Relate a tiny 2-parameter model to large models with billions of parameters",
  ],
  theory: [
    {
      heading: "The AI pipeline in one picture",
      content: "Every AI system follows the same basic flow:\n\nCollect data -> Clean & prepare -> Choose features -> Train model -> Evaluate -> Deploy -> Inference (use) -> Monitor\n\nAnalogy: preparing for an exam. The textbooks and past papers are the data, the topics you focus on are features, studying is training, the mock test is evaluation, and writing the real exam is inference.",
      points: [
        "Data: examples from the real world (rows in a sheet, images, text, audio)",
        "Model: the 'brain' - a mathematical function that turns input into output",
        "Training: the model learns from data by adjusting its parameters",
        "Evaluation: test the model on data it has not seen",
        "Inference: the trained model answers new questions in a real app",
      ],
    },
    {
      heading: "Data, labels and features",
      content: "Data is the fuel of AI. In a house-price table, each row is one example (one house). Features are the input columns the model looks at (size, bedrooms, location). The label (or target) is the answer we want the model to predict (price). Choosing good features is like giving a detective the right clues.",
      syntax: "| size_sqft | bedrooms | city   | price (label) |\n| 1000      | 2        | Pune   | 60 lakh       |\n| 1500      | 3        | Mumbai | 1.8 crore     |\n  ^ features (inputs)  ^          ^ label (output)",
      points: [
        "Structured data: tables (Excel, SQL). Unstructured data: text, images, audio, video",
        "Labelled data has the correct answer attached (needed for supervised learning)",
        "Garbage in, garbage out: wrong, missing or biased data gives a bad model",
        "Data is usually split into a training set (to learn) and a test set (to check)",
        "For images, features are pixel values; for text, features become numbers via tokens and embeddings",
      ],
      tip: "Most real AI projects spend more time collecting and cleaning data than training models.",
    },
    {
      heading: "A model is a function with knobs (parameters)",
      content: "A model is a formula like: price = w x size + b. Here w (weight) and b (bias) are parameters - the knobs the model can turn. Before training, the knobs are at random or zero positions, so predictions are bad. Training turns the knobs until predictions match the data. Analogy: tuning an old radio - you turn the dial until the noise disappears and the station is clear.",
      points: [
        "Weight: how much a feature matters (bigger weight = stronger influence)",
        "Bias: a base value added regardless of input (the starting point)",
        "Our demo model has 2 parameters. A spam filter may have thousands. Large language models have billions",
        "Hyperparameters are settings YOU choose before training (learning rate, number of epochs, model size); parameters are learned BY the model",
      ],
    },
    {
      heading: "Training: guess, measure error, adjust, repeat",
      content: "Training is a loop:\n1. Guess: make predictions with current parameters\n2. Measure: compute the loss (how wrong the guesses are), for example mean squared error\n3. Adjust: nudge each parameter a little in the direction that reduces loss (gradient descent)\n4. Repeat many times (each full pass over the data is an epoch)\n\nAnalogy: walking down a foggy hill to the valley. You cannot see the bottom, but you can feel which way is downhill under your feet and take small steps. The size of each step is the learning rate.",
      points: [
        "Loss function: a single number for 'how wrong' - lower is better",
        "Gradient descent: the method to find which way to turn each knob",
        "Learning rate too big: you jump over the valley; too small: training takes forever",
        "Training large models needs huge data and many GPUs for weeks; it is expensive and done rarely",
      ],
    },
    {
      heading: "Inference: using the trained model",
      content: "After training, the parameters are frozen and saved. Inference means giving the model a new input and getting a prediction, without changing the parameters. When you chat with Claude or ChatGPT, you are doing inference: the model does not learn from your chat in real time; it uses what it learned during training plus whatever you put in the conversation (the context).",
      points: [
        "Training: slow, expensive, done once in a while, updates parameters",
        "Inference: fast, done millions of times a day, parameters stay the same",
        "Inference cost depends on model size and input/output length (for LLMs this is measured in tokens)",
        "Models can become outdated: their knowledge stops at their training cutoff unless given new info via search or documents",
      ],
      tip: "A chat assistant 'remembering' something you said earlier in the same chat is the context window at work, not training.",
    },
    {
      heading: "Evaluation, overfitting and generalisation",
      content: "A good model must work on new data, not just the training data. If a model memorises the training examples, it scores very well on them but poorly on new data - this is overfitting, like a student who memorises answers to last year's paper and fails when questions change. Underfitting is the opposite: the model is too simple to learn the pattern.",
      points: [
        "Always evaluate on a separate test set the model never saw during training",
        "Common metrics: accuracy for classification, error (MAE/RMSE) for numbers",
        "Generalisation = performing well on unseen data - the real goal of ML",
      ],
    },
  ],
  examples: [
    {
      title: "Train a 2-parameter model with gradient descent (pure Python)",
      scenario: "A shop's price follows price = 2 x size + 1, but the model does not know that. It must discover w = 2 and b = 1 from four examples, then predict the price for size 10.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Watch w and b move toward 2 and 1 while the loss falls toward 0",
        "Change lr to 0.2 and run again - notice what happens to the loss (it may blow up)",
        "Change lr to 0.001 - notice training becomes very slow",
      ],
      code: trainingDemo,
      python: { files: { "main.py": trainingDemo }, stdin: "" },
      result: `epoch   1: w=1.750 b=0.600 loss=1.1288
epoch  10: w=2.084 b=0.754 loss=0.0101
epoch 100: w=2.022 b=0.937 loss=0.0007
epoch 500: w=2.000 b=1.000 loss=0.0000
Prediction for size 10: 21.0
Number of parameters in this model: 2`,
      explanation: "The loop is the training phase: predict, measure error, compute which direction reduces the error (dw, db), and nudge the parameters by the learning rate. After 500 epochs the model found w = 2 and b = 1 by itself. The last lines are inference: the parameters are frozen and simply used to compute 2 x 10 + 1 = 21. A large language model does the same thing with billions of parameters and text instead of numbers.",
    },
    {
      title: "Identify features, label and model for real problems with a chat assistant",
      scenario: "Practise breaking any AI problem into data, features, label, model type and evaluation.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini) and start a new chat",
        "Paste the prompt below",
        "Check that every label is the thing to be predicted and features are inputs available BEFORE the prediction",
        "Ask a follow-up: 'Which of these features could cause bias?'",
      ],
      code: `For each problem below, give: Data source | Features (inputs) | Label (output) | Training or inference example | One way to evaluate.
1. Predict if a bank transaction is fraud
2. Predict tomorrow's sales of a bakery
3. Detect whether a photo contains a helmet (traffic camera)
Answer as a table, simple English for a beginner.`,
      prompt: {
        system: "You are a patient machine learning tutor for beginners.",
        user: "For each problem below, give: Data source | Features (inputs) | Label (output) | Training or inference example | One way to evaluate.\n1. Predict if a bank transaction is fraud\n2. Predict tomorrow's sales of a bakery\n3. Detect whether a photo contains a helmet (traffic camera)\nAnswer as a table, simple English for a beginner.",
      },
      result: "A table such as: Fraud - features: amount, time, location, merchant type, past behaviour; label: fraud yes/no; evaluate with precision/recall on past transactions. Bakery - features: day of week, weather, holidays, past sales; label: units sold; evaluate with average error. Helmet - features: image pixels; label: helmet yes/no; evaluate with accuracy on new photos.",
      explanation: "Every AI problem can be described with the same vocabulary. Being able to write this table is the first step of any AI project and a common interview exercise.",
    },
    {
      title: "Training vs inference: ask the assistant about itself",
      scenario: "Understand what a chat assistant can and cannot 'learn' from your conversation.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Then open a NEW chat and ask 'What is my favourite colour?' - notice it does not know (unless a memory feature is turned on)",
        "Write down: context window vs training vs product memory features",
      ],
      code: `My favourite colour is teal. Remember it.
Now explain in 5 bullet points:
1) Did you just learn this by training, or is it only in this conversation's context?
2) What is the difference between training and inference for a model like you?
3) What is a training cutoff?
4) What are parameters, roughly, in a large language model?
5) What would happen if I asked you in a brand-new chat?`,
      prompt: {
        system: "You are an honest AI assistant. Explain your own limitations accurately and simply.",
        user: "My favourite colour is teal. Remember it.\nNow explain in 5 bullet points:\n1) Did you just learn this by training, or is it only in this conversation's context?\n2) What is the difference between training and inference for a model like you?\n3) What is a training cutoff?\n4) What are parameters, roughly, in a large language model?\n5) What would happen if I asked you in a brand-new chat?",
      },
      result: "The assistant explains that the colour is only in the current conversation's context (inference), not added to its parameters; training happened earlier on large datasets; the training cutoff is the date its knowledge ends; parameters are the learned numbers (often billions); a new chat would not know the colour unless a separate memory feature stores it.",
      explanation: "Many beginners think chatbots learn instantly from them. In reality the model's parameters are fixed during use; products may add separate 'memory' features that save notes and paste them back into the context.",
    },
    {
      title: "Spot overfitting with a memorising 'model'",
      scenario: "See why testing on unseen data matters, using a quick prompt-based thought experiment.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Read the analogy and the warning signs",
        "Relate them back to the training loop in Example 1",
      ],
      code: `Explain overfitting and underfitting using a student preparing for an exam.
Then give: 3 warning signs of overfitting in a real ML project, and 3 ways to reduce it.
Keep it under 200 words.`,
      prompt: {
        system: "You are a machine learning teacher who uses simple analogies.",
        user: "Explain overfitting and underfitting using a student preparing for an exam.\nThen give: 3 warning signs of overfitting in a real ML project, and 3 ways to reduce it.\nKeep it under 200 words.",
      },
      result: "Overfitting = memorising last year's answers (perfect on practice paper, fails new questions); underfitting = studying too little to see any pattern. Warning signs: very high training accuracy but low test accuracy; performance drops on new data; very complex model with small data. Fixes: more data, simpler model, regularisation / cross-validation / early stopping.",
      explanation: "Generalising to new data is the true goal. You will measure this with real code on Day 40.",
    },
  ],
  tools: [
    { name: "Python IDE (in-app)", use: "Run the training-loop demo in the browser", url: "/tools/python-ide" },
    { name: "ML Playground (in-app)", use: "Click to add points and watch linear regression fit a line", url: "/tools/ml-playground" },
    { name: "Claude", use: "Break problems into features and labels; explain concepts", url: "https://claude.ai" },
  ],
  interview: [
    { q: "What is the difference between training and inference?", a: "Training is the phase where the model learns by adjusting its parameters to reduce error on data. Inference is using the trained model with frozen parameters to make predictions on new inputs.", level: "Easy" },
    { q: "What are features and labels?", a: "Features are the input variables the model uses (for example size, bedrooms). The label or target is the output we want to predict (price). Supervised learning needs both.", level: "Easy" },
    { q: "What is a parameter in a machine learning model?", a: "A value the model learns during training, such as weights and biases. They determine how inputs are turned into outputs. LLMs have billions of parameters.", level: "Easy" },
    { q: "Parameter vs hyperparameter?", a: "Parameters are learned from data (weights, biases). Hyperparameters are chosen by the developer before training (learning rate, number of epochs, number of layers, batch size).", level: "Medium" },
    { q: "What is a loss function?", a: "A function that measures how wrong the model's predictions are, such as mean squared error for regression or cross-entropy for classification. Training tries to minimise it.", level: "Medium" },
    { q: "Explain gradient descent simply.", a: "It is an optimisation method that repeatedly computes the slope (gradient) of the loss with respect to each parameter and moves the parameters a small step (learning rate) in the downhill direction to reduce loss.", level: "Medium" },
    { q: "What happens if the learning rate is too high or too low?", a: "Too high: updates overshoot the minimum and loss may oscillate or explode. Too low: training is very slow and may get stuck.", level: "Medium" },
    { q: "Why do we split data into training and test sets?", a: "To check how well the model generalises to unseen data. Evaluating on training data hides overfitting.", level: "Easy" },
    { q: "What is overfitting and how can you detect it?", a: "When a model memorises training data, including noise, and performs poorly on new data. Detect it when training accuracy is much higher than validation/test accuracy.", level: "Medium" },
    { q: "Does a chat assistant learn from my conversation in real time?", a: "No. During a chat the model runs inference with fixed parameters; it only 'remembers' what is in the current context window. Some products add memory features that store notes separately, and providers may use data for future training only according to their policies and settings.", level: "Hard" },
  ],
  practice: [
    { task: "In the gradient descent demo, change the data to follow price = 3 x size + 2 and check that the model finds w = 3 and b = 2.", hint: "New data: (1,5), (2,8), (3,11), (4,14). You may need more epochs.", solution: "With data = [(1, 5), (2, 8), (3, 11), (4, 14)] and lr 0.05 the output ends with: epoch 500: w=3.000 b=2.000 loss=0.0000 and Prediction for size 10: 32.0" },
    { task: "Write features and a label for: predicting whether a student will pass an exam.", hint: "Use information available before the exam.", solution: "Features: attendance %, hours studied per week, previous test marks, assignments submitted, sleep hours. Label: pass/fail (or final marks if predicting a number)." },
    { task: "Explain training vs inference to a friend using a cooking analogy, in 4 sentences.", hint: "Learning a recipe vs cooking dinner tonight.", solution: "Training is like practising a dish many times, tasting and adjusting salt and spice until it is right. It takes time and ingredients. Inference is cooking that perfected dish for guests: you follow what you learned without re-learning. If guests want a new dish, you need more practice (retraining)." },
    { task: "Try learning rates 0.001, 0.05 and 0.2 in the demo. Record the loss at epoch 500 for each.", hint: "Very large learning rates can make values grow instead of shrink.", solution: "0.001: at epoch 500 w=2.083 b=0.753 loss=0.0102 (still learning, slow). 0.05: loss=0.0000 with w=2.000 b=1.000. 0.2: the first update jumps to w=7, by epoch 10 w is about -10327 and the numbers explode until Python raises OverflowError - training diverged. Lesson: the learning rate is a key hyperparameter." },
    { task: "Open the ML Playground (/tools/ml-playground), add 6 points in a rough line, and run linear regression. Then add one extreme outlier and run again.", hint: "Watch how much the line moves.", solution: "The line fits the points; adding a single far-away outlier pulls the line noticeably, showing how bad data affects a model's parameters." },
  ],
  quiz: [
    { question: "What is a 'label' in supervised learning?", options: ["An input column", "The correct answer the model should predict", "The learning rate", "The name of the model"], answer: 1, explanation: "The label (target) is the output the model learns to predict." },
    { question: "Which happens during inference?", options: ["Parameters are updated", "Loss is minimised with gradient descent", "The trained model makes predictions on new input", "The dataset is labelled"], answer: 2, explanation: "Inference uses the frozen trained model to predict." },
    { question: "In price = w x size + b, what are w and b?", options: ["Parameters learned during training", "Hyperparameters", "Labels", "Features"], answer: 0, explanation: "Weight and bias are learned parameters." },
    { question: "A model scores 99% on training data but 60% on test data. This is most likely:", options: ["Underfitting", "Perfect generalisation", "Low learning rate", "Overfitting"], answer: 3, explanation: "A large train/test gap is the classic sign of overfitting." },
    { question: "Which is a hyperparameter?", options: ["A weight", "A bias", "The learning rate", "A prediction"], answer: 2, explanation: "Learning rate is chosen by the developer before training." },
  ],
};
