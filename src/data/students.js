// Students shown on the landing page ("Our learners" section).
// ⚠ These are PLACEHOLDER photos (random portraits from randomuser.me) and sample names.
// Before publishing the site, replace them with your real students (with their permission):
//   1. put the photos in /public/students/ (e.g. public/students/asha.jpg)
//   2. change `photo` to '/students/asha.jpg' (or './students/asha.jpg') and set the real name / course / city.
const rp = (g, n) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;

export const STUDENTS = [
  { name: 'Aarav', course: 'Java Full Stack', city: 'Pune', photo: rp('men', 32) },
  { name: 'Priya', course: 'Power BI', city: 'Mumbai', photo: rp('women', 44) },
  { name: 'Rohan', course: 'React', city: 'Nagpur', photo: rp('men', 75) },
  { name: 'Sneha', course: 'Python Full Stack', city: 'Nashik', photo: rp('women', 68) },
  { name: 'Kunal', course: '.NET Full Stack', city: 'Aurangabad', photo: rp('men', 12) },
  { name: 'Ananya', course: 'Excel', city: 'Kolhapur', photo: rp('women', 21) },
  { name: 'Vikram', course: 'MySQL', city: 'Solapur', photo: rp('men', 46) },
  { name: 'Pooja', course: 'AI', city: 'Thane', photo: rp('women', 57) },
  { name: 'Siddharth', course: 'Node.js + Express', city: 'Satara', photo: rp('men', 64) },
  { name: 'Neha', course: 'Web Development', city: 'Sangli', photo: rp('women', 33) },
  { name: 'Aditya', course: 'Java Full Stack', city: 'Amravati', photo: rp('men', 85) },
  { name: 'Riya', course: 'React', city: 'Jalgaon', photo: rp('women', 90) },
  { name: 'Omkar', course: 'Python Full Stack', city: 'Ahmednagar', photo: rp('men', 22) },
  { name: 'Kavya', course: 'Power BI', city: 'Latur', photo: rp('women', 12) },
  { name: 'Yash', course: 'MERN Stack', city: 'Navi Mumbai', photo: rp('men', 51) },
  { name: 'Isha', course: 'Data Analytics', city: 'Pune', photo: rp('women', 79) },
];
