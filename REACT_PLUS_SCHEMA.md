# React course extension: Day 31–60 (industry track, React Native, final projects)

Read /home/stn/Pictures/DayWise/EXcel_And_PoweBI/WEB_SYLLABUS_SCHEMA.md first: the lesson format, `playground` field, quality rules and
validation command are the SAME as the React days 1–30. Look at 2 existing files in `src/data/react-days/` (e.g. day-13 and day-23) to match the style and depth.

Folder: `src/data/react-days/day-NN-<slug>.js` with `day: N` (N = 31…60). `id` = filename without `.js`.
Module names: exactly as written below (e.g. `module: 'Module 8: Working with APIs like a Pro'`).

## Playground options
1. React web demos: `playground: { jsx, css? }` exactly as in WEB_SYLLABUS_SCHEMA.md (React 18 globals, `function App()`, no imports, no createRoot).
   Libraries such as Axios, TanStack Query, Tailwind, MUI, Framer Motion, Recharts, Firebase… cannot be imported in the playground:
   show the REAL industry code in `code` (with imports), and make the playground a working plain-React demo of the same idea
   (e.g. a tiny `useQuery`-like hook with a cache, an `fetch` wrapper that behaves like an Axios interceptor, CSS transitions instead of Framer Motion,
   an SVG bar chart instead of Recharts) and say clearly in `explanation` that it is a plain-React version.
   Public APIs that work in the browser: https://dummyjson.com (products, carts, users, auth/login), https://jsonplaceholder.typicode.com,
   https://api.open-meteo.com + https://geocoding-api.open-meteo.com (weather, no key), https://picsum.photos (images).
2. React Native demos (Day 56, 57, 60 and anywhere useful): `playground: { rn: '<App.js code>', device: 'android' | 'ios' }`.
   The playground renders it in a phone frame with react-native-web. Write normal Expo code:
   `import { useState } from 'react'; import { View, Text, StyleSheet, Pressable, FlatList, TextInput, ScrollView, Image, ActivityIndicator, Switch } from 'react-native';`
   and `export default function App() { … }`. Supported imports ONLY: `react`, `react-native`, `expo-status-bar`, `@expo/vector-icons` (icons render as simple symbols),
   `react-native-safe-area-context`. React Navigation / AsyncStorage / expo-location are NOT available in the playground: put the real code in `code`
   and simulate in the playground (screen switching with useState, an in-memory store). Use `Pressable` (not `onClick`), `onChangeText`, `StyleSheet.create`,
   flexbox (default `flexDirection: 'column'`), no HTML tags, every string inside `<Text>`.

## Quality rules (in addition to WEB_SYLLABUS_SCHEMA.md)
- Current versions: React 19 (mention React 18 differences where relevant), Vite 6, React Router 7 (library mode, same API as v6), TanStack Query v5, Redux Toolkit 2,
  Zustand 5, React Hook Form 7 + Zod 3, Tailwind CSS 4, MUI 6, Framer Motion (`motion` package), Recharts 2, Axios 1, Expo SDK 52 / React Native 0.76.
- These are INDUSTRY lessons: show how real companies do it (folder structure, naming, error/loading states, reusable hooks/components, accessibility),
  common mistakes and best practices, and what interviewers ask. Use Indian context in examples where natural (₹ prices, Indian cities, names).
- Every lesson: 4–7 theory sections, 3–6 solved examples with steps, 8–12 interview Q&A, 4–6 practice tasks with full solutions, exactly 5 quiz MCQs.
- Final project days (57–60): bigger lessons — requirements/user stories, folder structure, step-by-step build in examples (each example = one feature with full code),
  a complete runnable playground of the whole app (web: `jsx`; mobile: `rn`), deployment steps, a checklist, 12+ interview Q&A about the project
  (Day 60: 30+ React interview Q&A), and practice tasks that extend the project.
- Validation: the command in WEB_SYLLABUS_SCHEMA.md. For every playground: `jsx` must compile with esbuild/Babel as JSX; `rn` code must compile as JSX ES modules
  (e.g. `npx esbuild --loader=jsx` on a temp file) and use only the supported imports. Sanity-check that fetch URLs and JSON fields you use really exist (curl them).

## React – Day 31–60 syllabus
Module 7: Industry Project Setup & UI (Day 31–35)
31 Professional React Project Setup: feature-based folder structure, path aliases, ESLint + Prettier, .env variables, Git branching workflow
32 Tailwind CSS with React: utility-first classes, responsive design, dark mode, building reusable UI components (Button, Card, Badge)
33 UI Component Libraries: Material UI, shadcn/ui, Ant Design: setup, theming, common components, and when to choose which
34 Layouts & Responsive Dashboards: Header, Sidebar, Main layout with Outlet, mobile menu, icons (lucide-react), images and fonts
35 UX Patterns used in every company: loading skeletons, empty and error states, toasts (react-hot-toast), modals and confirm dialogs
Module 8: Working with APIs like a Pro (Day 36–40)
36 Axios in Depth: instances, baseURL, interceptors, auth headers, error handling, request cancel, API service layer
37 TanStack Query (React Query): useQuery, useMutation, caching, staleTime, invalidation, optimistic updates, devtools
38 Search, Filters, Sorting and Pagination with URL search params (useSearchParams) and debounced search
39 Infinite Scroll and Virtualized Lists: IntersectionObserver, useInfiniteQuery, react-window
40 File Upload: image preview, validation (type/size), progress bar, FormData, drag-and-drop
Module 9: Authentication & Security (Day 41–44)
41 JWT Authentication in React: login/register forms, AuthContext, storing tokens, Axios interceptor, logout, auto-login
42 Protected and Role-based Routes (admin/user), refresh tokens, session expiry handling, permission-based UI
43 Firebase / Supabase as a Backend for React: authentication, database CRUD, real-time listeners, security rules overview
44 Security in React Apps: XSS and dangerouslySetInnerHTML, sanitizing (DOMPurify), secrets in env vars, CORS, CSP and dependency audits
Module 10: Advanced Industry Topics (Day 45–52)
45 Charts and Dashboards: Recharts / Chart.js, KPI cards, building an admin analytics dashboard
46 Data Tables: sorting, filtering, pagination, row selection with TanStack Table
47 Advanced Forms: multi-step wizard, React Hook Form + Zod schemas, dynamic fields (useFieldArray), form state persistence
48 Animations with Framer Motion: motion components, variants, AnimatePresence, page transitions, gestures
49 Internationalization (react-i18next) and Accessibility (ARIA, keyboard navigation, focus management, screen readers)
50 Real-time UI: WebSockets and Socket.io client, live notifications, chat UI, polling vs WebSockets
51 React 19 Features: Actions, useActionState, useOptimistic, useFormStatus, use(), ref as a prop, React Compiler overview
52 Performance in Production: React Profiler, Lighthouse, Core Web Vitals, bundle analysis, image optimisation, memoisation pitfalls
Module 11: Testing, Quality & Deployment (Day 53–55)
53 Testing like the Industry: React Testing Library + user-event, MSW API mocking, Playwright end-to-end basics
54 Storybook and Design Systems, code reviews, PR checklist, conventional commits, team workflow
55 CI/CD and Deployment: GitHub Actions, Vercel/Netlify, environment per stage, PWA with vite-plugin-pwa
Module 12: React Native & Final Projects (Day 56–60)
56 React Native with Expo: View, Text, StyleSheet, Flexbox, Pressable, TextInput, FlatList, ScrollView, Image; React web vs React Native; running on a phone with Expo Go; React Navigation basics
57 Final Project 1: Temperature / Weather App (React web + React Native): Open-Meteo API, city search, current location (geolocation), °C/°F toggle, hourly and 7-day forecast, favourite cities in localStorage, loading/error states, deployment
58 Final Project 2 (Part 1): E-commerce Website: product listing from an API (dummyjson.com), categories, search/filter/sort, product details page, cart with Context + useReducer, localStorage persistence
59 Final Project 2 (Part 2): E-commerce Website: login, checkout with form validation, orders history, admin dashboard (product CRUD + sales chart), payment gateway overview (Razorpay/Stripe test mode), deployment
60 Final Project 3: E-commerce Mobile Application with React Native (Expo): home, product list, details, cart, checkout screens, bottom tabs + stack navigation; plus React Interview Masterclass and Final Test (30+ Q&A)
