// Sample databases for the MongoDB Shell Lab. Simple numeric _id values keep results easy to read;
// in real MongoDB _id is usually an ObjectId (new documents you insert get one automatically).

const d = (s) => ({ $date: s }); // stored as ISO strings, shown like ISODate("…")

export const DATASETS = {
  shop: {
    title: 'E-commerce shop',
    about: 'products, customers and orders (with an items array) for an online store in India',
    collections: {
      products: [
        { _id: 1, name: 'iPhone 15', brand: 'Apple', category: 'Mobiles', price: 79900, stock: 12, rating: 4.7, tags: ['5g', 'ios'] },
        { _id: 2, name: 'Galaxy S24', brand: 'Samsung', category: 'Mobiles', price: 74999, stock: 20, rating: 4.5, tags: ['5g', 'android'] },
        { _id: 3, name: 'Redmi Note 13', brand: 'Xiaomi', category: 'Mobiles', price: 17999, stock: 55, rating: 4.2, tags: ['5g', 'android', 'budget'] },
        { _id: 4, name: 'MacBook Air M3', brand: 'Apple', category: 'Laptops', price: 114900, stock: 6, rating: 4.8, tags: ['macos'] },
        { _id: 5, name: 'IdeaPad Slim 3', brand: 'Lenovo', category: 'Laptops', price: 45990, stock: 15, rating: 4.1, tags: ['windows', 'budget'] },
        { _id: 6, name: 'Inspiron 15', brand: 'Dell', category: 'Laptops', price: 52990, stock: 0, rating: 4.0, tags: ['windows'] },
        { _id: 7, name: 'boAt Airdopes 141', brand: 'boAt', category: 'Audio', price: 1299, stock: 140, rating: 4.0, tags: ['wireless', 'budget'] },
        { _id: 8, name: 'Sony WH-1000XM5', brand: 'Sony', category: 'Audio', price: 29990, stock: 9, rating: 4.6, tags: ['wireless', 'anc'] },
        { _id: 9, name: 'JBL Flip 6', brand: 'JBL', category: 'Audio', price: 9999, stock: 25, rating: 4.4, tags: ['wireless', 'speaker'] },
        { _id: 10, name: 'Apple Watch SE', brand: 'Apple', category: 'Wearables', price: 29900, stock: 11, rating: 4.5, tags: ['ios'] },
        { _id: 11, name: 'Noise ColorFit Pro 5', brand: 'Noise', category: 'Wearables', price: 3999, stock: 60, rating: 3.9, tags: ['budget'] },
        { _id: 12, name: 'Logitech MX Master 3S', brand: 'Logitech', category: 'Accessories', price: 9495, stock: 18, rating: 4.7, tags: ['wireless'] },
      ],
      customers: [
        { _id: 101, name: 'Asha Patil', email: 'asha@example.com', city: 'Pune', age: 24, prime: true, joined: d('2024-02-11T00:00:00Z') },
        { _id: 102, name: 'Ravi Kumar', email: 'ravi@example.com', city: 'Mumbai', age: 31, prime: false, joined: d('2023-11-03T00:00:00Z') },
        { _id: 103, name: 'Neha Shah', email: 'neha@example.com', city: 'Ahmedabad', age: 28, prime: true, joined: d('2024-06-20T00:00:00Z') },
        { _id: 104, name: 'Imran Khan', email: 'imran@example.com', city: 'Pune', age: 35, prime: false, joined: d('2022-08-15T00:00:00Z') },
        { _id: 105, name: 'Priya Desai', email: 'priya@example.com', city: 'Bengaluru', age: 26, prime: true, joined: d('2025-01-05T00:00:00Z') },
        { _id: 106, name: 'Rahul Joshi', email: 'rahul@example.com', city: 'Nashik', age: 22, prime: false, joined: d('2025-03-18T00:00:00Z') },
        { _id: 107, name: 'Sneha More', email: 'sneha@example.com', city: 'Mumbai', age: 29, prime: true, joined: d('2023-05-09T00:00:00Z') },
        { _id: 108, name: 'Karan Mehta', email: 'karan@example.com', city: 'Delhi', age: 40, prime: false, joined: d('2022-12-01T00:00:00Z') },
      ],
      orders: [
        { _id: 1001, customerId: 101, status: 'delivered', payment: 'UPI', orderDate: d('2025-01-10T10:15:00Z'), items: [{ productId: 3, qty: 1, price: 17999 }, { productId: 7, qty: 2, price: 1299 }], total: 20597 },
        { _id: 1002, customerId: 102, status: 'delivered', payment: 'Card', orderDate: d('2025-01-14T18:40:00Z'), items: [{ productId: 4, qty: 1, price: 114900 }], total: 114900 },
        { _id: 1003, customerId: 103, status: 'shipped', payment: 'UPI', orderDate: d('2025-02-02T09:05:00Z'), items: [{ productId: 8, qty: 1, price: 29990 }], total: 29990 },
        { _id: 1004, customerId: 101, status: 'delivered', payment: 'COD', orderDate: d('2025-02-14T12:30:00Z'), items: [{ productId: 11, qty: 1, price: 3999 }, { productId: 12, qty: 1, price: 9495 }], total: 13494 },
        { _id: 1005, customerId: 104, status: 'cancelled', payment: 'Card', orderDate: d('2025-02-20T16:00:00Z'), items: [{ productId: 2, qty: 1, price: 74999 }], total: 74999 },
        { _id: 1006, customerId: 105, status: 'delivered', payment: 'UPI', orderDate: d('2025-03-03T11:45:00Z'), items: [{ productId: 1, qty: 1, price: 79900 }, { productId: 10, qty: 1, price: 29900 }], total: 109800 },
        { _id: 1007, customerId: 106, status: 'pending', payment: 'COD', orderDate: d('2025-03-09T20:10:00Z'), items: [{ productId: 7, qty: 3, price: 1299 }], total: 3897 },
        { _id: 1008, customerId: 107, status: 'delivered', payment: 'UPI', orderDate: d('2025-03-15T08:25:00Z'), items: [{ productId: 5, qty: 1, price: 45990 }, { productId: 12, qty: 1, price: 9495 }], total: 55485 },
        { _id: 1009, customerId: 103, status: 'delivered', payment: 'Card', orderDate: d('2025-04-01T14:00:00Z'), items: [{ productId: 9, qty: 2, price: 9999 }], total: 19998 },
        { _id: 1010, customerId: 108, status: 'shipped', payment: 'Card', orderDate: d('2025-04-06T19:30:00Z'), items: [{ productId: 2, qty: 1, price: 74999 }, { productId: 8, qty: 1, price: 29990 }], total: 104989 },
        { _id: 1011, customerId: 102, status: 'delivered', payment: 'UPI', orderDate: d('2025-04-18T10:00:00Z'), items: [{ productId: 3, qty: 2, price: 17999 }], total: 35998 },
        { _id: 1012, customerId: 105, status: 'pending', payment: 'UPI', orderDate: d('2025-05-02T09:15:00Z'), items: [{ productId: 11, qty: 2, price: 3999 }], total: 7998 },
      ],
    },
  },
  college: {
    title: 'College',
    about: 'students (with marks and skills), courses and enrollments for a college',
    collections: {
      students: [
        { _id: 1, name: 'Asha Patil', branch: 'CSE', year: 3, city: 'Pune', cgpa: 8.9, skills: ['Python', 'React'], marks: { maths: 88, dsa: 92, dbms: 79 } },
        { _id: 2, name: 'Ravi Kumar', branch: 'IT', year: 2, city: 'Mumbai', cgpa: 7.2, skills: ['Java'], marks: { maths: 65, dsa: 70, dbms: 58 } },
        { _id: 3, name: 'Neha Shah', branch: 'CSE', year: 4, city: 'Ahmedabad', cgpa: 9.4, skills: ['Node.js', 'MongoDB', 'React'], marks: { maths: 95, dsa: 90, dbms: 98 } },
        { _id: 4, name: 'Imran Khan', branch: 'ENTC', year: 3, city: 'Pune', cgpa: 6.8, skills: ['C', 'IoT'], marks: { maths: 72, dsa: 61, dbms: 66 } },
        { _id: 5, name: 'Priya Desai', branch: 'IT', year: 4, city: 'Bengaluru', cgpa: 8.1, skills: ['Python', 'SQL'], marks: { maths: 81, dsa: 84, dbms: 88 } },
        { _id: 6, name: 'Rahul Joshi', branch: 'CSE', year: 1, city: 'Nashik', cgpa: 7.8, skills: [], marks: { maths: 77, dsa: 0, dbms: 0 } },
        { _id: 7, name: 'Sneha More', branch: 'MECH', year: 2, city: 'Mumbai', cgpa: 7.5, skills: ['AutoCAD'], marks: { maths: 70, dsa: 55, dbms: 60 } },
        { _id: 8, name: 'Karan Mehta', branch: 'CSE', year: 4, city: 'Delhi', cgpa: 8.6, skills: ['Node.js', 'Express', 'MongoDB', 'React'], marks: { maths: 85, dsa: 89, dbms: 91 } },
        { _id: 9, name: 'Pooja Nair', branch: 'IT', year: 3, city: 'Kochi', cgpa: 9.1, skills: ['React', 'TypeScript'], marks: { maths: 90, dsa: 93, dbms: 85 } },
        { _id: 10, name: 'Amit Verma', branch: 'ENTC', year: 1, city: 'Pune', cgpa: 6.2, skills: ['C'], marks: { maths: 60, dsa: 0, dbms: 0 } },
      ],
      courses: [
        { _id: 'C101', title: 'Data Structures', credits: 4, dept: 'CSE', instructor: 'Dr. Kulkarni' },
        { _id: 'C102', title: 'Database Systems', credits: 4, dept: 'CSE', instructor: 'Prof. Iyer' },
        { _id: 'C103', title: 'Web Development (MERN)', credits: 3, dept: 'IT', instructor: 'Prof. Rao' },
        { _id: 'C104', title: 'Embedded Systems', credits: 3, dept: 'ENTC', instructor: 'Dr. Sharma' },
        { _id: 'C105', title: 'Machine Learning', credits: 4, dept: 'CSE', instructor: 'Dr. Menon' },
      ],
      enrollments: [
        { _id: 1, studentId: 1, courseId: 'C101', grade: 'A', semester: 5 },
        { _id: 2, studentId: 1, courseId: 'C103', grade: 'A+', semester: 5 },
        { _id: 3, studentId: 2, courseId: 'C103', grade: 'B', semester: 3 },
        { _id: 4, studentId: 3, courseId: 'C102', grade: 'A+', semester: 7 },
        { _id: 5, studentId: 3, courseId: 'C105', grade: 'A', semester: 7 },
        { _id: 6, studentId: 4, courseId: 'C104', grade: 'B+', semester: 5 },
        { _id: 7, studentId: 5, courseId: 'C102', grade: 'A', semester: 7 },
        { _id: 8, studentId: 8, courseId: 'C103', grade: 'A+', semester: 7 },
        { _id: 9, studentId: 8, courseId: 'C101', grade: 'A', semester: 7 },
        { _id: 10, studentId: 9, courseId: 'C103', grade: 'A', semester: 5 },
        { _id: 11, studentId: 9, courseId: 'C105', grade: 'B+', semester: 5 },
        { _id: 12, studentId: 7, courseId: 'C101', grade: 'C', semester: 3 },
      ],
    },
  },
  blog: {
    title: 'Blog / social app',
    about: 'users, posts (with tags, likes and embedded comments) for a MERN blog app',
    collections: {
      users: [
        { _id: 1, username: 'asha_dev', name: 'Asha Patil', role: 'admin', followers: 1520, verified: true },
        { _id: 2, username: 'ravi_codes', name: 'Ravi Kumar', role: 'author', followers: 340, verified: false },
        { _id: 3, username: 'neha_js', name: 'Neha Shah', role: 'author', followers: 980, verified: true },
        { _id: 4, username: 'karan_m', name: 'Karan Mehta', role: 'reader', followers: 45, verified: false },
        { _id: 5, username: 'pooja_ui', name: 'Pooja Nair', role: 'author', followers: 610, verified: true },
      ],
      posts: [
        { _id: 1, authorId: 3, title: 'Understanding the Node.js Event Loop', tags: ['node', 'javascript'], likes: 230, published: true, createdAt: d('2025-01-05T09:00:00Z'), comments: [{ userId: 4, text: 'Very clear, thanks!' }, { userId: 2, text: 'Great diagrams' }] },
        { _id: 2, authorId: 2, title: 'REST APIs with Express in 10 minutes', tags: ['express', 'node', 'api'], likes: 120, published: true, createdAt: d('2025-01-19T12:00:00Z'), comments: [{ userId: 1, text: 'Add error handling please' }] },
        { _id: 3, authorId: 5, title: 'React Hooks Cheat Sheet', tags: ['react', 'hooks'], likes: 410, published: true, createdAt: d('2025-02-02T08:30:00Z'), comments: [] },
        { _id: 4, authorId: 3, title: 'MongoDB Aggregation for Beginners', tags: ['mongodb', 'database'], likes: 185, published: true, createdAt: d('2025-02-21T10:15:00Z'), comments: [{ userId: 5, text: 'The $lookup part helped me a lot' }, { userId: 4, text: 'More examples please' }, { userId: 2, text: 'Bookmarked' }] },
        { _id: 5, authorId: 1, title: 'JWT Auth in a MERN App', tags: ['mern', 'auth', 'jwt'], likes: 320, published: true, createdAt: d('2025-03-10T15:45:00Z'), comments: [{ userId: 3, text: 'What about refresh tokens?' }] },
        { _id: 6, authorId: 5, title: 'Tailwind vs CSS Modules', tags: ['css', 'react'], likes: 95, published: false, createdAt: d('2025-03-28T11:00:00Z'), comments: [] },
        { _id: 7, authorId: 2, title: 'Deploying MERN on Render and Vercel', tags: ['mern', 'deployment'], likes: 150, published: true, createdAt: d('2025-04-12T07:20:00Z'), comments: [{ userId: 4, text: 'Worked first time!' }] },
        { _id: 8, authorId: 3, title: 'Mongoose Middleware Explained', tags: ['mongodb', 'mongoose', 'node'], likes: 75, published: false, createdAt: d('2025-05-01T13:10:00Z'), comments: [] },
      ],
    },
  },
};

export const DATASET_NAMES = Object.keys(DATASETS);
