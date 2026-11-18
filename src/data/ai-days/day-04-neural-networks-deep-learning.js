const perceptronDemo = `# A single artificial neuron (perceptron) learns the AND gate
data = [((0, 0), 0), ((0, 1), 0), ((1, 0), 0), ((1, 1), 1)]
w1, w2, bias = 0.0, 0.0, 0.0
lr = 0.1

def step(z):                      # activation: fire (1) or not (0)
    return 1 if z > 0 else 0

for epoch in range(1, 11):
    mistakes = 0
    for (x1, x2), target in data:
        out = step(w1 * x1 + w2 * x2 + bias)
        error = target - out          # +1, 0 or -1
        if error != 0:
            mistakes += 1
            w1 += lr * error * x1     # nudge weights toward the answer
            w2 += lr * error * x2
            bias += lr * error
    print(f"epoch {epoch}: mistakes={mistakes} w1={w1:.1f} w2={w2:.1f} bias={bias:.1f}")
    if mistakes == 0:
        break

for (x1, x2), target in data:
    print(x1, "AND", x2, "=", step(w1 * x1 + w2 * x2 + bias))
`;

const forwardDemo = `# Forward pass of a tiny 2-layer network with sigmoid and ReLU
import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

def relu(z):
    return max(0.0, z)

# Input: [hours studied, hours slept]
x = [6.0, 7.0]

# Hidden layer: 2 neurons, each with its own weights and bias
hidden_w = [[0.5, 0.2], [-0.3, 0.4]]
hidden_b = [-2.0, 0.5]
hidden = []
for w, b in zip(hidden_w, hidden_b):
    z = w[0] * x[0] + w[1] * x[1] + b
    hidden.append(relu(z))
print("Hidden layer outputs:", [round(h, 2) for h in hidden])

# Output layer: 1 neuron -> probability of passing the exam
out_w, out_b = [0.6, 0.3], -1.5
z = out_w[0] * hidden[0] + out_w[1] * hidden[1] + out_b
print("Pass probability:", round(sigmoid(z), 3))
for v in (-4, 0, 4):
    print(f"sigmoid({v}) = {sigmoid(v):.3f}   relu({v}) = {relu(v)}")
`;

export default {
  id: "day-04-neural-networks-deep-learning",
  title: "Neural Networks and Deep Learning (intuitive): neurons, layers, weights, activation, backpropagation in plain words",
  module: "Module 1: AI Foundations",
  day: 4,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Understand neural networks without heavy maths: an artificial neuron is a tiny voting machine, layers stack neurons to learn from simple to complex patterns, activation functions decide how strongly a neuron 'fires', and backpropagation is the blame-sharing process that tells each weight how to improve. You will train a single neuron and run a small network in pure Python.",
  objectives: [
    "Describe an artificial neuron: inputs, weights, bias, sum and activation",
    "Explain input, hidden and output layers and why 'deep' means many layers",
    "Compare common activation functions (step, sigmoid, ReLU, softmax)",
    "Explain forward pass, loss and backpropagation in plain words",
    "Name popular deep learning architectures (CNN, RNN, Transformer) and where they are used",
  ],
  theory: [
    {
      heading: "From brain neurons to artificial neurons",
      content: "Your brain has billions of neurons. Each receives signals from others, and if the total signal is strong enough, it 'fires' and passes a signal on. An artificial neuron copies this idea with simple maths:\n\n inputs (x1, x2, ...) --> multiply each by a weight --> add them up + bias --> activation --> output\n\nAnalogy: deciding whether to go out for a movie. Inputs: is it the weekend? are friends coming? is it raining? Each input has a weight (friends matter a lot, rain matters negatively). You add everything up; if the total crosses your threshold, you go.",
      syntax: "z = (w1 * x1) + (w2 * x2) + ... + bias\noutput = activation(z)",
      points: [
        "Inputs: the numbers fed in (pixel values, word numbers, features)",
        "Weights: how important each input is; learned during training",
        "Bias: shifts the threshold, making the neuron easier or harder to fire",
        "Activation function: turns the sum into the output signal",
        "A single neuron is called a perceptron (Frank Rosenblatt, 1958)",
      ],
    },
    {
      heading: "Layers: input, hidden, output - and why 'deep'",
      content: "One neuron can only learn very simple patterns. Connect many neurons in layers and they can learn complex ones.\n\n[Input layer] -> [Hidden layer 1] -> [Hidden layer 2] -> ... -> [Output layer]\n  pixels           edges              shapes                      'cat' 87%\n\nIn image recognition, early layers learn edges and colours, middle layers learn shapes like eyes and ears, and later layers recognise whole objects. Deep learning simply means neural networks with many hidden layers.",
      points: [
        "Input layer: receives the raw data (one neuron per feature or pixel)",
        "Hidden layers: discover intermediate patterns automatically - no human writes them",
        "Output layer: gives the final answer (a number, or probabilities for each class)",
        "Fully connected (dense) layer: every neuron connects to every neuron of the next layer",
        "Deep networks have millions to billions of weights; large language models are very deep networks",
      ],
      tip: "Analogy: a factory assembly line. Each station (layer) does a small job and passes its output to the next, until the finished product (prediction) comes out.",
    },
    {
      heading: "Activation functions: how strongly a neuron fires",
      content: "Without activation functions, a network of any depth would behave like one simple straight-line formula. Activations add non-linearity, which lets networks learn curves and complex boundaries.",
      points: [
        "Step: output 1 if the sum is above 0, else 0 (the original perceptron; on/off switch)",
        "Sigmoid: squashes any number into 0 to 1 - good for a probability, like a dimmer switch",
        "ReLU (Rectified Linear Unit): output = max(0, z); negative becomes 0, positive passes through. Simple and fast, the default for hidden layers",
        "Softmax: turns a list of scores into probabilities that add up to 100% - used in the output layer for multi-class tasks and for choosing the next token in LLMs",
        "Tanh: like sigmoid but from -1 to 1",
      ],
    },
    {
      heading: "Forward pass, loss and backpropagation (plain words)",
      content: "Training a neural network repeats three steps:\n1. Forward pass: data flows from input to output and the network makes a prediction.\n2. Loss: compare the prediction with the correct answer to get an error score.\n3. Backpropagation: send the error backwards through the network, calculating how much each weight contributed to the mistake (blame sharing), then nudge every weight a little to reduce the error (gradient descent).\n\nAnalogy: a cricket team loses a match. The coach reviews the game backwards - the last over, then the middle overs, then the opening - and gives each player feedback proportional to their contribution to the loss. Next match, everyone adjusts a little. After many matches, the team improves.",
      points: [
        "Epoch: one full pass over the training data",
        "Batch: a small group of examples processed together before updating weights",
        "Learning rate: how big each weight nudge is",
        "Backpropagation uses the chain rule from calculus, but frameworks like PyTorch and TensorFlow do it automatically",
        "Training needs lots of data and compute (GPUs/TPUs), which is why big models are expensive to train",
      ],
    },
    {
      heading: "Popular deep learning architectures",
      content: "Different network designs suit different data. You do not need the maths now - just know what each is good at.",
      points: [
        "Feed-forward / MLP: basic layers of neurons for tabular data",
        "CNN (Convolutional Neural Network): slides small filters over images to detect patterns; used in face unlock, medical imaging, self-driving perception",
        "RNN / LSTM: process sequences one step at a time with a memory; used earlier for speech and translation",
        "Transformer (2017): uses attention to look at all words at once; powers Claude, GPT, Gemini, Llama and many vision and audio models (Day 9)",
        "Diffusion models: generate images by removing noise step by step; used in many image generators (Day 11)",
      ],
      tip: "Deep learning wins when data is large and unstructured (images, audio, text). For small tables of data, simpler ML (like decision trees) often works just as well.",
    },
  ],
  examples: [
    {
      title: "Train a single neuron (perceptron) to learn the AND gate",
      scenario: "The AND gate outputs 1 only when both inputs are 1. The neuron starts with all weights at 0 and must learn the right weights from the four examples.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Watch the mistakes per epoch fall to 0",
        "Check the final truth table: only 1 AND 1 gives 1",
        "Change the targets to the OR gate (0,1,1,1) and run again",
      ],
      code: perceptronDemo,
      python: { files: { "main.py": perceptronDemo }, stdin: "" },
      result: `epoch 1: mistakes=1 w1=0.1 w2=0.1 bias=0.1
epoch 2: mistakes=3 w1=0.2 w2=0.1 bias=0.0
epoch 3: mistakes=3 w1=0.2 w2=0.1 bias=-0.1
epoch 4: mistakes=2 w1=0.2 w2=0.2 bias=-0.1
epoch 5: mistakes=1 w1=0.2 w2=0.1 bias=-0.2
epoch 6: mistakes=0 w1=0.2 w2=0.1 bias=-0.2
0 AND 0 = 0
0 AND 1 = 0
1 AND 0 = 0
1 AND 1 = 1`,
      explanation: "Each time the neuron is wrong, it nudges each weight in the direction that would have given the right answer (the perceptron learning rule - a simple version of what backpropagation does in big networks). After 6 epochs the weights (0.2, 0.1) and bias (-0.2) make the sum positive only when both inputs are 1. Famous limitation: a single neuron cannot learn XOR - you need a hidden layer, which is why networks have multiple layers.",
    },
    {
      title: "Forward pass through a tiny 2-layer network (ReLU + sigmoid)",
      scenario: "A tiny network takes hours studied and hours slept and outputs a probability of passing an exam. The weights are fixed (pretend it was already trained) so you can trace every calculation.",
      steps: [
        "Paste the code into the Python IDE and click Run",
        "Check the hidden neuron 1 by hand: 0.5 x 6 + 0.2 x 7 - 2.0 = 2.4",
        "Check hidden neuron 2: -0.3 x 6 + 0.4 x 7 + 0.5 = 1.5",
        "Check the output: 0.6 x 2.4 + 0.3 x 1.5 - 1.5 = 0.39, and sigmoid(0.39) is about 0.596",
        "Change x to [1.0, 4.0] and see the probability drop",
      ],
      code: forwardDemo,
      python: { files: { "main.py": forwardDemo }, stdin: "" },
      result: `Hidden layer outputs: [2.4, 1.5]
Pass probability: 0.596
sigmoid(-4) = 0.018   relu(-4) = 0.0
sigmoid(0) = 0.500   relu(0) = 0.0
sigmoid(4) = 0.982   relu(4) = 4`,
      explanation: "This is exactly what happens during inference in any neural network, just at a tiny scale: multiply by weights, add bias, apply activation, pass to the next layer. The last lines show the activations: sigmoid squashes values into 0-1, ReLU turns negatives into 0 and keeps positives.",
    },
    {
      title: "Explain backpropagation with your own analogy (chat assistant)",
      scenario: "Get several analogies for backpropagation and pick the one that clicks for you.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Choose your favourite analogy and rewrite it in your own words in your notes",
        "Ask a follow-up: 'Now show the same idea with one neuron and actual numbers'",
      ],
      code: `Explain backpropagation to a beginner with no calculus.
Give 3 different analogies (sports team, cooking, school exam).
Then summarise the training loop in 4 numbered steps: forward pass, loss, backpropagation, weight update.
Max 220 words.`,
      prompt: {
        system: "You are a deep learning teacher. Use plain English and no equations unless asked.",
        user: "Explain backpropagation to a beginner with no calculus.\nGive 3 different analogies (sports team, cooking, school exam).\nThen summarise the training loop in 4 numbered steps: forward pass, loss, backpropagation, weight update.\nMax 220 words.",
      },
      result: "Three analogies (for example: a coach reviewing a lost match backwards, a cook adjusting each ingredient after tasting, a student reviewing which steps caused a wrong answer) and a 4-step loop: 1) forward pass makes a prediction, 2) loss measures the error, 3) backpropagation calculates each weight's share of the blame, 4) weights are nudged to reduce the error.",
      explanation: "Generating multiple analogies and choosing one is a great way to learn hard concepts with AI. The follow-up connects the analogy to real numbers, like the perceptron demo.",
    },
    {
      title: "Which architecture for which job?",
      scenario: "Decide which neural network type fits each real problem.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Compare the answer with the 'Popular deep learning architectures' section",
        "Ask why Transformers replaced RNNs for most language tasks",
      ],
      code: `For each task, suggest the most suitable neural network architecture (MLP, CNN, RNN/LSTM, Transformer, Diffusion) and one reason:
1. Detect defects in photos of factory parts
2. Translate English to Hindi
3. Predict loan default from 20 numeric columns
4. Generate a poster image from a text description
5. Build a chat assistant
Answer as a table.`,
      prompt: {
        system: "You are an AI architect explaining choices to beginners. One short reason per row.",
        user: "For each task, suggest the most suitable neural network architecture (MLP, CNN, RNN/LSTM, Transformer, Diffusion) and one reason:\n1. Detect defects in photos of factory parts\n2. Translate English to Hindi\n3. Predict loan default from 20 numeric columns\n4. Generate a poster image from a text description\n5. Build a chat assistant\nAnswer as a table.",
      },
      result: "1 CNN (or vision transformer) - good at image patterns; 2 Transformer - attention handles long sentences; 3 MLP or even simpler ML like gradient-boosted trees - tabular data; 4 Diffusion model (often guided by a transformer text encoder); 5 Transformer-based LLM.",
      explanation: "Matching data type to architecture is a key design skill. Modern systems often combine architectures, for example text encoders plus diffusion for image generation.",
    },
  ],
  tools: [
    { name: "TensorFlow Playground", use: "Visually train a small neural network in the browser and watch neurons and weights change", url: "https://playground.tensorflow.org" },
    { name: "Python IDE (in-app)", use: "Run the perceptron and forward-pass demos", url: "/tools/python-ide" },
    { name: "Claude", use: "Get analogies and step-by-step explanations", url: "https://claude.ai" },
  ],
  interview: [
    { q: "What is an artificial neuron?", a: "A unit that multiplies each input by a weight, adds them with a bias, and applies an activation function to produce an output. It is loosely inspired by biological neurons.", level: "Easy" },
    { q: "What are weights and biases?", a: "Weights determine how strongly each input influences the neuron; the bias shifts the activation threshold. Both are learned during training.", level: "Easy" },
    { q: "Why do we need activation functions?", a: "They introduce non-linearity. Without them, stacking layers would still be equivalent to a single linear transformation, so the network could not learn complex patterns.", level: "Medium" },
    { q: "Compare sigmoid and ReLU.", a: "Sigmoid maps inputs to 0-1, useful for probabilities, but its gradients become tiny for large inputs (vanishing gradients). ReLU outputs max(0, z), is cheap to compute and trains deep networks faster, so it is the default for hidden layers.", level: "Medium" },
    { q: "What is backpropagation?", a: "An algorithm that computes how much each weight contributed to the loss by propagating the error backwards from output to input using the chain rule. The gradients are then used by gradient descent to update weights.", level: "Medium" },
    { q: "What does 'deep' mean in deep learning?", a: "The network has many hidden layers, allowing it to learn hierarchical features (edges -> shapes -> objects).", level: "Easy" },
    { q: "Why can't a single perceptron learn XOR?", a: "XOR is not linearly separable - no single straight line separates its outputs. A single perceptron draws only one straight boundary; a hidden layer is needed.", level: "Hard" },
    { q: "What is softmax used for?", a: "It converts a vector of scores (logits) into probabilities that sum to 1. Used in the output layer for multi-class classification and in LLMs to get probabilities over possible next tokens.", level: "Medium" },
    { q: "What is a CNN good for?", a: "Grid-like data such as images. Convolutional filters detect local patterns (edges, textures) and share weights across the image, making them efficient for vision tasks.", level: "Medium" },
    { q: "What is the vanishing gradient problem?", a: "In deep networks, gradients can shrink as they are multiplied backwards through many layers, so early layers learn very slowly. ReLU, careful initialisation, normalisation and residual connections help.", level: "Hard" },
  ],
  practice: [
    { task: "Change the perceptron data to the OR gate (targets 0, 1, 1, 1) and run. How many epochs does it need?", hint: "Edit the second value in each data tuple.", solution: "data = [((0,0),0), ((0,1),1), ((1,0),1), ((1,1),1)]. Real run: mistakes reach 0 at epoch 4 (w1=0.1 w2=0.1 bias=0.0) and the table prints 0, 1, 1, 1. (The print text still says AND - change the word to OR if you like.)" },
    { task: "Change the perceptron to XOR (targets 0, 1, 1, 0) and run. What happens?", hint: "Look at the mistakes column after 10 epochs.", solution: "Real run: from epoch 3 onwards it prints mistakes=4 every epoch (w1=-0.1 w2=0.0 bias=0.1) and the final table is wrong (1, 1, 0, 0). A single neuron can never learn XOR because it is not linearly separable. This shows why hidden layers are needed." },
    { task: "In the forward-pass demo, compute by hand the pass probability for x = [2.0, 5.0], then check by running.", hint: "Hidden 1 = 0.5x2 + 0.2x5 - 2.0; Hidden 2 = -0.3x2 + 0.4x5 + 0.5; apply ReLU then the output formula.", solution: "Hidden 1 = 1.0 + 1.0 - 2.0 = 0.0 -> ReLU 0.0. Hidden 2 = -0.6 + 2.0 + 0.5 = 1.9. Output z = 0 + 0.57 - 1.5 = -0.93; sigmoid(-0.93) is about 0.283." },
    { task: "Open TensorFlow Playground (playground.tensorflow.org), choose the circle dataset, and train with 0 hidden layers, then with 2 hidden layers.", hint: "Press the play button and watch the test loss.", solution: "With no hidden layers the network can only draw a straight boundary and fails on the circle. With hidden layers it learns a curved boundary and test loss drops - the power of depth and non-linear activations." },
    { task: "Ask a chat assistant: 'Draw a neural network with 3 inputs, one hidden layer of 4 neurons and 2 outputs using text characters, and count the weights.'", hint: "Weights = inputs x hidden + hidden x outputs (plus biases).", solution: "Weights: 3x4 + 4x2 = 20, plus 4 + 2 = 6 biases, total 26 parameters. Check that the assistant's count matches." },
  ],
  quiz: [
    { question: "In an artificial neuron, what is computed before the activation function?", options: ["Weighted sum of inputs plus bias", "Only the bias", "The loss", "The softmax of labels"], answer: 0, explanation: "z = sum(weights x inputs) + bias, then activation(z)." },
    { question: "Which activation outputs max(0, z)?", options: ["Sigmoid", "Softmax", "Tanh", "ReLU"], answer: 3, explanation: "ReLU keeps positives and turns negatives into 0." },
    { question: "Backpropagation is used to:", options: ["Collect more data", "Compute how each weight should change to reduce the loss", "Run inference faster", "Label images"], answer: 1, explanation: "It distributes the error backwards to compute gradients for every weight." },
    { question: "Which architecture powers modern LLMs like Claude and GPT?", options: ["CNN", "Perceptron", "Transformer", "k-means"], answer: 2, explanation: "LLMs are built on the Transformer architecture (2017)." },
    { question: "Why can a single perceptron not learn XOR?", options: ["It has too many weights", "XOR is not linearly separable", "XOR needs images", "Perceptrons cannot output 0"], answer: 1, explanation: "A single neuron draws one straight line; XOR needs a non-linear boundary." },
  ],
};
