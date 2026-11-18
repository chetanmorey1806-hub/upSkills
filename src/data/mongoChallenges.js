// Auto-checked practice challenges for the MongoDB Shell Lab.
// The student's code runs on a fresh copy of the dataset and is compared with the reference solution's output.
// `check`: for write challenges, a query run after the student's code; its output must match the same query after the solution.
// `ordered`: compare documents in order (use when the task asks for sorting).

export const CHALLENGES = [
  // ---------------- Level 1: find & projection ----------------
  { id: 'f1', level: 'Basics', dataset: 'shop', title: 'All laptops', task: 'Find all products whose category is "Laptops".', hint: 'db.products.find({ field: value })', solution: 'db.products.find({ category: "Laptops" })' },
  { id: 'f2', level: 'Basics', dataset: 'shop', title: 'Names and prices only', task: 'Show only the name and price of every Apple product (hide _id).', hint: 'Second argument of find() is the projection: { name: 1, price: 1, _id: 0 }', solution: 'db.products.find({ brand: "Apple" }, { name: 1, price: 1, _id: 0 })' },
  { id: 'f3', level: 'Basics', dataset: 'shop', title: 'Out of stock', task: 'Find the product(s) with stock equal to 0.', hint: '{ stock: 0 }', solution: 'db.products.find({ stock: 0 })' },
  { id: 'f4', level: 'Basics', dataset: 'college', title: 'Find one student', task: 'Use findOne to get the student named "Neha Shah".', hint: 'findOne returns a single document (or null).', solution: 'db.students.findOne({ name: "Neha Shah" })' },
  { id: 'f5', level: 'Basics', dataset: 'shop', title: 'How many orders?', task: 'Count the orders whose status is "delivered".', hint: 'countDocuments(filter)', solution: 'db.orders.countDocuments({ status: "delivered" })' },

  // ---------------- Level 2: operators ----------------
  { id: 'o1', level: 'Operators', dataset: 'shop', title: 'Price range', task: 'Find products priced between 10000 and 50000 (both inclusive). Show name and price only.', hint: '{ price: { $gte: …, $lte: … } }', solution: 'db.products.find({ price: { $gte: 10000, $lte: 50000 } }, { name: 1, price: 1, _id: 0 })' },
  { id: 'o2', level: 'Operators', dataset: 'shop', title: 'Mobiles OR wearables', task: 'Find products in the category "Mobiles" or "Wearables" using $in.', hint: '{ category: { $in: [ … ] } }', solution: 'db.products.find({ category: { $in: ["Mobiles", "Wearables"] } })' },
  { id: 'o3', level: 'Operators', dataset: 'shop', title: 'Budget wireless', task: 'Find products that have BOTH the tags "wireless" and "budget".', hint: 'Arrays: { tags: { $all: [ … ] } }', solution: 'db.products.find({ tags: { $all: ["wireless", "budget"] } })' },
  { id: 'o4', level: 'Operators', dataset: 'college', title: 'Good in DSA', task: 'Find students whose marks.dsa is greater than 85. Show name and marks.dsa only (no _id).', hint: 'Dot notation for embedded fields needs quotes: "marks.dsa"', solution: 'db.students.find({ "marks.dsa": { $gt: 85 } }, { name: 1, "marks.dsa": 1, _id: 0 })' },
  { id: 'o5', level: 'Operators', dataset: 'college', title: 'No skills yet', task: 'Find students whose skills array is empty.', hint: '{ skills: { $size: 0 } }', solution: 'db.students.find({ skills: { $size: 0 } })' },
  { id: 'o6', level: 'Operators', dataset: 'shop', title: 'Pune or premium', task: 'Find customers who live in Pune OR are prime members, older than 25.', hint: 'Combine { age: { $gt: 25 } } with { $or: [ … ] }', solution: 'db.customers.find({ age: { $gt: 25 }, $or: [{ city: "Pune" }, { prime: true }] })' },
  { id: 'o7', level: 'Operators', dataset: 'blog', title: 'Regex search', task: 'Find posts whose title contains the word "MongoDB" (case-insensitive).', hint: '{ title: { $regex: "mongodb", $options: "i" } } or /mongodb/i', solution: 'db.posts.find({ title: { $regex: "mongodb", $options: "i" } })' },

  // ---------------- Level 3: sort, limit, pagination ----------------
  { id: 's1', level: 'Sort & paginate', dataset: 'shop', title: 'Top 3 expensive', task: 'Show the 3 most expensive products (name and price, no _id), highest first.', hint: '.sort({ price: -1 }).limit(3)', solution: 'db.products.find({}, { name: 1, price: 1, _id: 0 }).sort({ price: -1 }).limit(3)', ordered: true },
  { id: 's2', level: 'Sort & paginate', dataset: 'shop', title: 'Page 2', task: 'Products sorted by _id ascending, 4 per page: return page 2.', hint: 'skip((page - 1) * size).limit(size)', solution: 'db.products.find().sort({ _id: 1 }).skip(4).limit(4)', ordered: true },
  { id: 's3', level: 'Sort & paginate', dataset: 'college', title: 'Rank by CGPA', task: 'List CSE students sorted by cgpa descending: name and cgpa only, no _id.', hint: 'Filter, projection, then sort.', solution: 'db.students.find({ branch: "CSE" }, { name: 1, cgpa: 1, _id: 0 }).sort({ cgpa: -1 })', ordered: true },
  { id: 's4', level: 'Sort & paginate', dataset: 'shop', title: 'Distinct cities', task: 'Get the list of distinct cities of customers.', hint: 'db.collection.distinct(field)', solution: 'db.customers.distinct("city")' },

  // ---------------- Level 4: insert, update, delete ----------------
  { id: 'w1', level: 'Write', dataset: 'shop', title: 'Add a product', task: 'Insert a product: _id 13, name "OnePlus Nord CE4", brand "OnePlus", category "Mobiles", price 24999, stock 30.', hint: 'insertOne({ … })', solution: 'db.products.insertOne({ _id: 13, name: "OnePlus Nord CE4", brand: "OnePlus", category: "Mobiles", price: 24999, stock: 30 })', check: 'db.products.find({ _id: 13 })' },
  { id: 'w2', level: 'Write', dataset: 'shop', title: '10% price cut', task: 'Reduce the price of every "Audio" product by 10% (multiply by 0.9).', hint: '{ $mul: { price: 0.9 } }', solution: 'db.products.updateMany({ category: "Audio" }, { $mul: { price: 0.9 } })', check: 'db.products.find({ category: "Audio" }, { name: 1, price: 1 })' },
  { id: 'w3', level: 'Write', dataset: 'shop', title: 'Restock', task: 'Increase the stock of the "Inspiron 15" by 10 and set its tag list to also contain "restocked" (no duplicates).', hint: '$inc and $addToSet in the same update', solution: 'db.products.updateOne({ name: "Inspiron 15" }, { $inc: { stock: 10 }, $addToSet: { tags: "restocked" } })', check: 'db.products.find({ name: "Inspiron 15" })' },
  { id: 'w4', level: 'Write', dataset: 'blog', title: 'Add a comment', task: 'Push a comment { userId: 1, text: "Nice post" } into the comments array of post _id 3.', hint: '$push', solution: 'db.posts.updateOne({ _id: 3 }, { $push: { comments: { userId: 1, text: "Nice post" } } })', check: 'db.posts.find({ _id: 3 }, { comments: 1 })' },
  { id: 'w5', level: 'Write', dataset: 'shop', title: 'Remove cancelled', task: 'Delete all cancelled orders.', hint: 'deleteMany(filter)', solution: 'db.orders.deleteMany({ status: "cancelled" })', check: 'db.orders.find({}, { _id: 1, status: 1 })' },
  { id: 'w6', level: 'Write', dataset: 'shop', title: 'Upsert a customer', task: 'Update the customer with email "new@example.com": set name "Meera Iyer" and city "Chennai". If no such customer exists, create it (upsert). Use _id 109 in the filter too.', hint: 'updateOne({ _id: 109, email: … }, { $set: { … } }, { upsert: true })', solution: 'db.customers.updateOne({ _id: 109, email: "new@example.com" }, { $set: { name: "Meera Iyer", city: "Chennai" } }, { upsert: true })', check: 'db.customers.find({ _id: 109 })' },

  // ---------------- Level 5: aggregation ----------------
  { id: 'a1', level: 'Aggregation', dataset: 'shop', title: 'Products per category', task: 'Count products in each category. Output { _id: category, count }, sorted by count descending then _id ascending.', hint: '$group with { $sum: 1 }, then $sort', solution: 'db.products.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }])', ordered: true },
  { id: 'a2', level: 'Aggregation', dataset: 'shop', title: 'Revenue by status', task: 'Total order value (sum of total) for each status, highest first. Output { _id: status, revenue }.', hint: '$group by "$status" with $sum: "$total"', solution: 'db.orders.aggregate([{ $group: { _id: "$status", revenue: { $sum: "$total" } } }, { $sort: { revenue: -1 } }])', ordered: true },
  { id: 'a3', level: 'Aggregation', dataset: 'shop', title: 'Average price by brand', task: 'For brands with more than one product, show the average price rounded to 0 decimals: { _id: brand, avgPrice }, sorted by avgPrice descending.', hint: '$group → $match on a count → $project with $round', solution: 'db.products.aggregate([{ $group: { _id: "$brand", avgPrice: { $avg: "$price" }, n: { $sum: 1 } } }, { $match: { n: { $gt: 1 } } }, { $project: { avgPrice: { $round: ["$avgPrice", 0] } } }, { $sort: { avgPrice: -1 } }])', ordered: true },
  { id: 'a4', level: 'Aggregation', dataset: 'shop', title: 'Best-selling products', task: 'Using order items, find the total quantity sold per productId (exclude cancelled orders). Top 3 by quantity, then by _id ascending: { _id: productId, qty }.', hint: '$match → $unwind: "$items" → $group by "$items.productId"', solution: 'db.orders.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $unwind: "$items" }, { $group: { _id: "$items.productId", qty: { $sum: "$items.qty" } } }, { $sort: { qty: -1, _id: 1 } }, { $limit: 3 }])', ordered: true },
  { id: 'a5', level: 'Aggregation', dataset: 'shop', title: 'Join customers', task: 'For each order with total above 100000, show the order _id, total and the customer name as a field `customer` (string). Sort by total descending.', hint: '$match → $lookup from customers → $unwind → $project { total: 1, customer: "$cust.name" }', solution: 'db.orders.aggregate([{ $match: { total: { $gt: 100000 } } }, { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "cust" } }, { $unwind: "$cust" }, { $project: { total: 1, customer: "$cust.name" } }, { $sort: { total: -1 } }])', ordered: true },
  { id: 'a6', level: 'Aggregation', dataset: 'college', title: 'Most common skills', task: 'Count how many students have each skill. Show the top 3 skills: { _id: skill, students }, sorted by students descending then _id ascending.', hint: '$unwind the skills array first', solution: 'db.students.aggregate([{ $unwind: "$skills" }, { $group: { _id: "$skills", students: { $sum: 1 } } }, { $sort: { students: -1, _id: 1 } }, { $limit: 3 }])', ordered: true },
  { id: 'a7', level: 'Aggregation', dataset: 'blog', title: 'Comments per post', task: 'For published posts, show title and the number of comments as `comments`, most commented first, then by title ascending. No _id.', hint: '$project with { $size: "$comments" }', solution: 'db.posts.aggregate([{ $match: { published: true } }, { $project: { _id: 0, title: 1, comments: { $size: "$comments" } } }, { $sort: { comments: -1, title: 1 } }])', ordered: true },
  { id: 'a8', level: 'Aggregation', dataset: 'shop', title: 'Monthly sales', task: 'Group non-cancelled orders by month of orderDate: { _id: month number, orders, revenue }, sorted by month.', hint: '{ $month: "$orderDate" }', solution: 'db.orders.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: { $month: "$orderDate" }, orders: { $sum: 1 }, revenue: { $sum: "$total" } } }, { $sort: { _id: 1 } }])', ordered: true },

  // ---------------- Level 6: indexes ----------------
  { id: 'i1', level: 'Indexes', dataset: 'shop', title: 'Unique emails', task: 'Create a unique index on customers.email, then list the indexes of customers.', hint: 'createIndex({ email: 1 }, { unique: true }) then getIndexes()', solution: 'db.customers.createIndex({ email: 1 }, { unique: true })\ndb.customers.getIndexes()' },
  { id: 'i2', level: 'Indexes', dataset: 'shop', title: 'COLLSCAN to IXSCAN', task: 'Create an index on products.category and show the winning plan of find({ category: "Audio" }) so it uses IXSCAN.', hint: 'db.products.find(…).explain().queryPlanner.winningPlan', solution: 'db.products.createIndex({ category: 1 })\ndb.products.find({ category: "Audio" }).explain().queryPlanner.winningPlan' },
];

export const CHALLENGE_LEVELS = [...new Set(CHALLENGES.map((c) => c.level))];

export const CHEATSHEET = [
  ['Read', 'db.products.find({ price: { $gt: 1000 } }, { name: 1, _id: 0 }).sort({ price: -1 }).limit(5)'],
  ['One', 'db.customers.findOne({ email: "asha@example.com" })'],
  ['Count', 'db.orders.countDocuments({ status: "delivered" })'],
  ['Insert', 'db.products.insertOne({ name: "Pen", price: 10 })'],
  ['Update', 'db.products.updateMany({ category: "Audio" }, { $inc: { stock: 5 } })'],
  ['Upsert', 'db.users.updateOne({ email: "x@y.com" }, { $set: { name: "X" } }, { upsert: true })'],
  ['Arrays', 'db.posts.updateOne({ _id: 1 }, { $push: { tags: "new" } })'],
  ['Delete', 'db.orders.deleteMany({ status: "cancelled" })'],
  ['Group', 'db.orders.aggregate([{ $group: { _id: "$status", total: { $sum: "$total" } } }])'],
  ['Join', 'db.orders.aggregate([{ $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customer" } }])'],
  ['Index', 'db.customers.createIndex({ email: 1 }, { unique: true })'],
  ['Explain', 'db.products.find({ category: "Audio" }).explain()'],
];
