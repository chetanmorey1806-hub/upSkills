const supUnsupDemo = `# SUPERVISED: 1-nearest-neighbour fruit classifier (labelled data)
train = [
    ((150, 7), "apple"), ((170, 8), "apple"), ((160, 7), "apple"),
    ((120, 3), "banana"), ((115, 2), "banana"), ((125, 3), "banana"),
]   # (weight in grams, roundness 1-10) -> label

def distance(a, b):
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5

def predict(item):
    nearest = min(train, key=lambda row: distance(row[0], item))
    return nearest[1]

for fruit in [(155, 8), (118, 2)]:
    print("Supervised:", fruit, "->", predict(fruit))

# UNSUPERVISED: group customers by monthly spend, no labels given
spend = [200, 220, 250, 900, 950, 1000, 210, 980]
c1, c2 = spend[0], spend[3]          # two starting centres
for step in range(5):
    g1 = [s for s in spend if abs(s - c1) <= abs(s - c2)]
    g2 = [s for s in spend if abs(s - c1) > abs(s - c2)]
    c1, c2 = sum(g1) / len(g1), sum(g2) / len(g2)
print("Unsupervised: group A", g1, "centre", round(c1))
print("Unsupervised: group B", g2, "centre", round(c2))
`;

const rlDemo = `# REINFORCEMENT LEARNING: a robot learns which of 3 slot machines pays best
import random
random.seed(42)

true_win_chance = [0.2, 0.5, 0.8]       # hidden from the agent
value = [0.0, 0.0, 0.0]                 # agent's estimate of each machine
pulls = [0, 0, 0]
total_reward = 0

for t in range(1, 501):
    if random.random() < 0.1:           # explore 10% of the time
        arm = random.randrange(3)
    else:                               # exploit: pick best known machine
        arm = value.index(max(value))
    reward = 1 if random.random() < true_win_chance[arm] else 0
    pulls[arm] += 1
    value[arm] += (reward - value[arm]) / pulls[arm]   # running average
    total_reward += reward

print("Pulls per machine:", pulls)
print("Estimated win chance:", [round(v, 2) for v in value])
print("Total reward in 500 tries:", total_reward)
`;

export default {
  id: "day-03-machine-learning-basics-supervised-unsupervised-reinforcement",
  title: "Machine Learning Basics: Supervised, Unsupervised, Reinforcement Learning with real examples",
  module: "Module 1: AI Foundations",
  day: 3,
  level: "Beginner",
  duration: "2 hours",
  summary: "Learn the three main ways machines learn: supervised learning (learning with an answer key), unsupervised learning (finding groups without answers) and reinforcement learning (learning by trial, error and rewards). Run tiny pure-Python versions of each and map them to real products.",
  objectives: [
    "Explain supervised, unsupervised and reinforcement learning with analogies",
    "Differentiate classification from regression within supervised learning",
    "Describe clustering and other unsupervised tasks",
    "Understand agent, environment, action, reward and explore vs exploit in RL",
    "Pick the right learning type for a given business problem",
  ],
  theory: [
    {
      heading: "Three ways to learn (the big picture)",
      content: "Think of three ways a child learns:\n- Supervised: a teacher shows flashcards with answers ('this is an apple', 'this is a banana').\n- Unsupervised: the child gets a box of mixed toys with no instructions and sorts them into groups that look similar.\n- Reinforcement: the child learns to ride a bicycle by trying, falling (negative reward) and balancing (positive reward).\n\nMachine learning uses exactly these three styles.",
      syntax: "Supervised:     data + correct answers  -> learn to predict answers\nUnsupervised:   data only               -> discover structure / groups\nReinforcement:  actions + rewards       -> learn the best strategy",
      points: [
        "Supervised learning is the most common in business today",
        "Unsupervised learning is great for exploring data you do not understand yet",
        "Reinforcement learning shines in games, robotics, and also helped tune chat assistants (RLHF, Day 9)",
        "There are also mixes: semi-supervised (few labels) and self-supervised (labels made from the data itself, used to pre-train LLMs)",
      ],
    },
    {
      heading: "Supervised learning: classification and regression",
      content: "In supervised learning every training example has the correct answer (label). The model learns the mapping from inputs to answers. There are two main kinds of tasks:\n- Classification: predict a category. Spam or not spam? Which digit is this? Will the customer leave: yes/no?\n- Regression: predict a number. House price, tomorrow's temperature, delivery time in minutes.",
      points: [
        "Real examples: email spam filter, loan approval, disease detection from scans, product price prediction, sales forecasting",
        "Common algorithms: linear regression, logistic regression, decision trees, random forests, K-nearest neighbours (KNN), neural networks",
        "Cost: labels are often made by humans, which takes time and money",
        "Evaluation: accuracy/precision/recall for classification, MAE/RMSE for regression (Days 37-38)",
      ],
      tip: "Quick test: if the answer is a word or a category, it is classification; if it is a quantity, it is regression.",
    },
    {
      heading: "Unsupervised learning: finding hidden structure",
      content: "In unsupervised learning there are no labels. The model looks for patterns on its own. The most famous task is clustering: grouping similar items. Analogy: a librarian receiving 1,000 unlabelled books and arranging them into shelves by topic just by reading them.",
      points: [
        "Clustering (for example k-means): customer segments such as 'budget buyers' vs 'premium buyers'",
        "Anomaly detection: spot unusual transactions or machine readings that do not fit any normal pattern",
        "Dimensionality reduction (for example PCA): compress many columns into a few while keeping the important information, useful for visualising",
        "Association rules: 'people who buy bread often buy butter' (market-basket analysis)",
        "The groups have no names; a human must interpret them ('cluster 2 looks like students')",
      ],
    },
    {
      heading: "Reinforcement learning: trial, error and reward",
      content: "In reinforcement learning (RL), an agent takes actions in an environment and receives rewards or penalties. Over many attempts it learns a policy - a strategy for choosing actions that maximise total reward. Analogy: training a dog with treats. Nobody gives the dog a labelled dataset; it learns which behaviours earn treats.",
      syntax: "Agent --action--> Environment\n  ^                   |\n  +---reward, new state+",
      points: [
        "Agent: the learner (game player, robot, recommender)",
        "Environment: the world it acts in (game board, warehouse, website)",
        "Action, State, Reward: what it does, what it sees, what it gets",
        "Explore vs exploit: try new actions to learn more, or use the best-known action to earn reward now",
        "Real examples: AlphaGo, robots learning to walk, game AI, ad/recommendation optimisation, and RLHF used to make chat assistants more helpful and safer",
      ],
    },
    {
      heading: "Choosing the right type of learning",
      content: "Ask three questions: Do I have correct answers (labels) for past examples? Am I trying to explore or group data? Is the problem about a sequence of decisions with feedback? The answers point to the learning type.",
      points: [
        "Have labelled history and want to predict the same label for new cases -> Supervised",
        "Have lots of data but no labels, want groups or outliers -> Unsupervised",
        "Need an agent to make decisions step by step and can define a reward -> Reinforcement",
        "Modern LLMs combine all three: self-supervised pre-training on text, supervised fine-tuning on example conversations, and reinforcement learning from feedback",
      ],
      tip: "Use the in-app ML Playground (/tools/ml-playground) to try KNN and logistic regression (supervised) and k-means (unsupervised) by clicking points.",
    },
  ],
  examples: [
    {
      title: "Supervised (nearest neighbour) and unsupervised (clustering) in pure Python",
      scenario: "Classify fruits using labelled examples, then group customers by spending without any labels.",
      steps: [
        "Open the in-app Python IDE (/tools/python-ide)",
        "Paste the code into main.py and click Run",
        "Read the supervised predictions: the program copies the label of the most similar known fruit",
        "Read the unsupervised groups: the program found two spending groups with no labels at all",
        "Add a new customer spend of 600 and run again to see which group it joins",
      ],
      code: supUnsupDemo,
      python: { files: { "main.py": supUnsupDemo }, stdin: "" },
      result: `Supervised: (155, 8) -> apple
Supervised: (118, 2) -> banana
Unsupervised: group A [200, 220, 250, 210] centre 220
Unsupervised: group B [900, 950, 1000, 980] centre 958`,
      explanation: "Supervised: the nearest-neighbour model compares a new fruit with labelled examples and copies the closest label (this is KNN with K = 1). Unsupervised: a mini k-means repeatedly assigns each value to the nearest centre and moves each centre to the average of its group. It discovered 'low spenders' and 'high spenders' without being told - but a human must name the groups.",
    },
    {
      title: "Reinforcement learning: the 3-slot-machine robot",
      scenario: "A robot does not know which of three machines pays best. It learns by trying (explore) and repeating what works (exploit).",
      steps: [
        "Open the Python IDE and paste the code into main.py",
        "Click Run",
        "Notice that the robot pulled machine 3 (index 2) most often - it learned that it pays best",
        "Change the 0.1 exploration rate to 0.5 and run again: more exploring, usually less total reward",
        "Change it to 0.0 (never explore) and see whether the robot gets stuck on a worse machine",
      ],
      code: rlDemo,
      python: { files: { "main.py": rlDemo }, stdin: "" },
      result: `Pulls per machine: [83, 16, 401]
Estimated win chance: [0.19, 0.5, 0.79]
Total reward in 500 tries: 340`,
      explanation: "No labels were given, only rewards (1 for a win, 0 for a loss). The agent kept a running average of each machine's reward and mostly chose the best one, while still exploring 10% of the time. Its estimates (0.19, 0.5, 0.79) are close to the hidden truth (0.2, 0.5, 0.8). random.seed(42) makes the run repeatable.",
    },
    {
      title: "Which learning type? Let a chat assistant quiz you",
      scenario: "Practise choosing supervised, unsupervised or reinforcement learning for real business problems, with the assistant as a quiz master.",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Answer each question yourself before asking for the answer",
        "Type your answers in one message, e.g. '1 supervised-classification, 2 ...'",
        "Read the feedback and note any mistakes",
      ],
      code: `Act as a quiz master for machine learning basics.
Give me 8 short real-world business problems, one at a time numbered 1-8.
For each, I must answer: Supervised (classification or regression), Unsupervised, or Reinforcement.
Do NOT reveal answers until I reply. After my reply, mark each answer right/wrong with a one-line reason.`,
      prompt: {
        system: "You are a strict but encouraging ML quiz master. Never reveal answers before the student replies.",
        user: "Give me 8 short real-world business problems numbered 1-8. For each, I must answer: Supervised (classification or regression), Unsupervised, or Reinforcement. Do NOT reveal answers until I reply. After my reply, mark each answer right/wrong with a one-line reason.",
      },
      result: "A list like: 1. Predict next month's electricity bill (Supervised - regression). 2. Group shoppers into segments (Unsupervised). 3. Teach a warehouse robot to pick items efficiently (Reinforcement). 4. Detect fraudulent card payments from labelled history (Supervised - classification)... followed by feedback on your answers.",
      explanation: "Telling the assistant not to reveal answers turns it into an interactive tutor. This 'quiz me' pattern works for any topic in this course.",
    },
    {
      title: "Map ML types to apps you use every day",
      scenario: "Connect theory to products: which kind of learning is likely inside each feature?",
      steps: [
        "Open claude.ai (or ChatGPT / Gemini)",
        "Paste the prompt below",
        "Check the answers against today's theory",
        "Ask: 'Which of these probably combine more than one type?'",
      ],
      code: `For each feature, say the most likely ML type (supervised classification, supervised regression, unsupervised, reinforcement) and why, in one line:
- Swiggy/Zomato delivery time estimate
- Bank grouping customers into segments for offers
- Gmail spam filter
- A game AI that learns to win by playing itself
- Credit card unusual-transaction alert
- Uber/Ola surge price prediction`,
      prompt: {
        system: "You are an ML tutor. Be concise. Mention when a real product may combine several techniques.",
        user: "For each feature, say the most likely ML type (supervised classification, supervised regression, unsupervised, reinforcement) and why, in one line:\n- Swiggy/Zomato delivery time estimate\n- Bank grouping customers into segments for offers\n- Gmail spam filter\n- A game AI that learns to win by playing itself\n- Credit card unusual-transaction alert\n- Uber/Ola surge price prediction",
      },
      result: "Delivery time: supervised regression. Customer segments: unsupervised clustering. Spam filter: supervised classification. Self-play game AI: reinforcement learning. Unusual transaction: unsupervised anomaly detection (often combined with supervised fraud models). Surge price: supervised regression/forecasting (often with business rules).",
      explanation: "Real products often combine techniques, but each feature usually has one main learning type. Being able to reason about this is a common interview question.",
    },
  ],
  tools: [
    { name: "ML Playground (in-app)", use: "Try KNN, logistic regression (supervised) and k-means (unsupervised) visually", url: "/tools/ml-playground" },
    { name: "Python IDE (in-app)", use: "Run the supervised, unsupervised and RL demos", url: "/tools/python-ide" },
    { name: "Claude", use: "Quiz yourself on choosing the learning type", url: "https://claude.ai" },
  ],
  interview: [
    { q: "What are the main types of machine learning?", a: "Supervised learning (labelled data, predict labels), unsupervised learning (unlabelled data, find structure such as clusters), and reinforcement learning (agent learns actions from rewards). Semi-supervised and self-supervised are important variants.", level: "Easy" },
    { q: "What is the difference between classification and regression?", a: "Both are supervised. Classification predicts a discrete category (spam/not spam); regression predicts a continuous number (price, temperature).", level: "Easy" },
    { q: "Give two real examples of unsupervised learning.", a: "Customer segmentation with clustering and anomaly detection in transactions or sensor data. Others: topic grouping of documents, PCA for visualisation.", level: "Easy" },
    { q: "Explain reinforcement learning with an example.", a: "An agent interacts with an environment, takes actions, and receives rewards. For example, a game-playing agent gets +1 for winning; over many games it learns a policy that maximises rewards. AlphaGo used RL with self-play.", level: "Medium" },
    { q: "What is the exploration vs exploitation trade-off?", a: "Exploration means trying less-known actions to gather information; exploitation means choosing the action currently believed best. Too much exploration wastes reward, too little can lock the agent into a suboptimal choice. Epsilon-greedy balances them.", level: "Medium" },
    { q: "Is k-means supervised or unsupervised? Why?", a: "Unsupervised. It groups data points into k clusters by distance without using any labels.", level: "Easy" },
    { q: "What is self-supervised learning and where is it used?", a: "The model creates its own labels from the data, for example hiding the next word and predicting it. Large language models are pre-trained this way on huge text corpora.", level: "Hard" },
    { q: "You have 1 million customer records but no labels. The business wants marketing groups. Which approach?", a: "Unsupervised clustering (for example k-means) on behaviour features, then have humans interpret and name each cluster for marketing.", level: "Medium" },
    { q: "What is KNN?", a: "K-Nearest Neighbours is a simple supervised algorithm that predicts a new point's label from the majority label (or average value) of the K closest training points.", level: "Medium" },
    { q: "Why is labelled data expensive?", a: "Labels often require human experts (doctors for scans, lawyers for documents) and careful quality checks, which take time and money.", level: "Easy" },
  ],
  practice: [
    { task: "Add the fruit (130, 4) to the supervised demo's test list. Predict the answer by hand first, then run it.", hint: "Compute the distance to the closest apple and the closest banana.", solution: "Distance to (125,3) is about 5.1; to (150,7) about 20.2. Nearest is a banana, so the output is: Supervised: (130, 4) -> banana." },
    { task: "In the clustering demo, add the value 600 to the spend list. Which group does it join?", hint: "Compare its distance to each centre.", solution: "600 is 380 from about 220 and about 358 from the high centre, so it joins group B; group B's centre then drops (to about 886), showing that one point can shift a cluster." },
    { task: "Write 5 business problems of your own and label each as supervised-classification, supervised-regression, unsupervised or reinforcement.", hint: "Think of your college, a shop, a bank and a game.", solution: "Example: predict student dropout (classification), predict canteen daily sales (regression), group library books by borrowing patterns (unsupervised), teach a traffic-light controller to reduce waiting time (reinforcement), detect unusual Wi-Fi usage (unsupervised anomaly detection)." },
    { task: "In the RL demo, set the exploration rate to 0.0 and run. Then set it to 0.3. Compare total reward and pulls.", hint: "With 0.0 the robot always picks the first machine with the highest estimate.", solution: "With 0.0 the output is Pulls per machine: [500, 0, 0] and Total reward 86 - every estimate starts at 0, so the robot keeps picking machine 1 (index 0) and never discovers better machines. With 0.3 the output is Pulls [54, 83, 363] and Total reward 335 - it finds machine 3 but spends more pulls exploring than with 0.1 (reward 340). The lesson is the explore/exploit trade-off." },
    { task: "Open the ML Playground (/tools/ml-playground). Add two colours of points and run KNN; then add points without colours and run k-means.", hint: "KNN needs labels (colours); k-means does not.", solution: "KNN draws a boundary between the labelled colours (supervised). K-means finds groups and colours them itself (unsupervised)." },
  ],
  quiz: [
    { question: "Predicting a house price is an example of:", options: ["Clustering", "Reinforcement learning", "Supervised regression", "Supervised classification"], answer: 2, explanation: "Price is a number learned from labelled examples, so it is regression." },
    { question: "Grouping customers without any labels is:", options: ["Unsupervised learning", "Supervised learning", "Reinforcement learning", "Regression"], answer: 0, explanation: "No labels plus grouping = unsupervised clustering." },
    { question: "In reinforcement learning, the agent learns from:", options: ["Labelled examples only", "Rewards and penalties from its actions", "Clustering", "Manual if-else rules"], answer: 1, explanation: "RL learns a policy by maximising rewards over time." },
    { question: "Which is a classification problem?", options: ["Predicting tomorrow's temperature", "Predicting monthly sales", "Predicting delivery time", "Predicting whether an email is spam"], answer: 3, explanation: "Spam/not spam is a category." },
    { question: "LLMs are mainly pre-trained using:", options: ["Reinforcement learning only", "k-means clustering", "Self-supervised learning (predicting the next token)", "Hand-written rules"], answer: 2, explanation: "Pre-training predicts the next token, which makes labels from the text itself." },
  ],
};
