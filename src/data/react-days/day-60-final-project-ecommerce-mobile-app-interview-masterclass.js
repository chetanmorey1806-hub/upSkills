export default {
  id: 'day-60-final-project-ecommerce-mobile-app-interview-masterclass',
  title: 'Final Project 3: E-commerce Mobile App with React Native (Expo) + React Interview Masterclass and Final Test',
  module: 'Module 12: React Native & Final Projects',
  day: 60,
  level: 'Advanced',
  duration: '6 hours',
  summary:
    "Build \"ShopKart Mobile\", the Android/iOS version of your e-commerce store with Expo: Home, Product list, Product details, Cart and Checkout screens, bottom tabs + stack navigation, a cart in Context + useReducer saved with AsyncStorage, and an EAS build. Then finish the course with a React interview masterclass: how to explain your projects, 30+ must-know questions with answers, and a final test.",
  objectives: [
    'Plan a mobile e-commerce app: screens, navigation tree (tabs + stack) and shared state',
    'Build Home, Product list, Product details, Cart and Checkout screens with React Native core components',
    'Share cart state across tabs with Context + useReducer and persist it with AsyncStorage',
    'Handle mobile UX: safe areas, keyboard, pull to refresh, infinite scroll, loading and error states, and build with EAS',
    'Answer the most common React / React Native interview questions and explain your three final projects confidently',
  ],
  theory: [
    {
      heading: 'ShopKart Mobile: brief, screens and navigation tree',
      content:
        "**User stories:**\n1. As a shopper, I see a **Home** screen with a search bar, category chips, a banner and \"Top rated\" products.\n2. I can open a **Product list** for a category, scroll endlessly (load more) and pull to refresh.\n3. I can open **Product details** with an image carousel, price, rating, stock and \"Add to cart\".\n4. The **Cart** tab shows a badge with the item count; I can change quantities and see the total.\n5. **Checkout** asks for address and payment method, validates, and shows an order success screen.\n6. My cart is still there when I reopen the app.\n\n**Navigation tree (React Navigation 7):**\n- `RootStack` (native stack)\n  - `Tabs` (bottom tabs, header hidden)\n    - `HomeTab` → `HomeStack`: Home, ProductList, ProductDetails\n    - `CartTab`: Cart\n    - `ProfileTab`: Profile / Orders\n  - `Checkout` (presented as a modal over the tabs)\n  - `OrderSuccess`\n\nWhy this shape? Tabs keep their own history (switching to Cart and back keeps your place in Home), while Checkout sits **above** the tabs so the tab bar is hidden during payment. This is how Flipkart, Amazon and Myntra apps are structured.",
      syntax:
        "npx create-expo-app@latest ShopKartMobile --template blank\ncd ShopKartMobile\nnpx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \\\n  react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage expo-image\nnpx expo start",
    },
    {
      heading: 'Navigation code: tabs inside a stack, params and the cart badge',
      content:
        "Key APIs:\n- `navigation.navigate('ProductDetails', { id })` and `route.params.id`\n- Navigating into a nested navigator: `navigation.navigate('Tabs', { screen: 'CartTab' })`\n- `tabBarBadge: count || undefined` shows the cart count on the tab icon (read it from the cart context)\n- `presentation: 'modal'` for Checkout\n- After a successful order: `navigation.reset({ index: 0, routes: [{ name: 'OrderSuccess', params: { orderId } }] })` so Back cannot return to the paid checkout\n- Android hardware back button is handled by the stack automatically\n\n**Expo Router alternative:** `app/(tabs)/_layout.tsx` with `<Tabs>`, `app/(tabs)/index.tsx`, `app/product/[id].tsx`, `app/checkout.tsx` with `presentation: 'modal'` in the root `_layout`. Same concepts, file-based.",
      syntax:
        "const Root = createNativeStackNavigator();\nconst Tab = createBottomTabNavigator();\nconst HomeStack = createNativeStackNavigator();\n\nfunction HomeStackScreen() {\n  return (\n    <HomeStack.Navigator>\n      <HomeStack.Screen name=\"Home\" component={HomeScreen} options={{ title: 'ShopKart' }} />\n      <HomeStack.Screen name=\"ProductList\" component={ProductListScreen} options={({ route }) => ({ title: route.params.title })} />\n      <HomeStack.Screen name=\"ProductDetails\" component={ProductDetailsScreen} options={{ title: '' }} />\n    </HomeStack.Navigator>\n  );\n}\n\nfunction Tabs() {\n  const { count } = useCart();\n  return (\n    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2563eb' }}>\n      <Tab.Screen name=\"HomeTab\" component={HomeStackScreen} options={{ title: 'Home' }} />\n      <Tab.Screen name=\"CartTab\" component={CartScreen} options={{ title: 'Cart', tabBarBadge: count || undefined, headerShown: true }} />\n      <Tab.Screen name=\"ProfileTab\" component={ProfileScreen} options={{ title: 'Profile', headerShown: true }} />\n    </Tab.Navigator>\n  );\n}\n\nexport default function App() {\n  return (\n    <CartProvider>\n      <NavigationContainer>\n        <Root.Navigator>\n          <Root.Screen name=\"Tabs\" component={Tabs} options={{ headerShown: false }} />\n          <Root.Screen name=\"Checkout\" component={CheckoutScreen} options={{ presentation: 'modal' }} />\n          <Root.Screen name=\"OrderSuccess\" component={OrderSuccessScreen} options={{ headerShown: false }} />\n        </Root.Navigator>\n      </NavigationContainer>\n    </CartProvider>\n  );\n}",
      tip: 'Put the CartProvider OUTSIDE NavigationContainer (or at least above all navigators) so every screen, including modals, reads the same cart.',
    },
    {
      heading: 'State, data and persistence on mobile',
      content:
        "**Reuse from the web project:** the API module (fetchProducts, fetchProduct), the cartReducer and selectors, formatINR. Business logic is plain JavaScript, so it moves to React Native unchanged; only the UI and storage differ.\n\n**Cart persistence with AsyncStorage:** AsyncStorage is asynchronous, so you cannot use a lazy initialiser like localStorage. Pattern: start with an empty cart and `hydrated = false`, load in a `useEffect` and dispatch `{ type: 'HYDRATE', items }`, then save on every change **only after hydration** (otherwise the empty initial cart overwrites the saved one).\n\n**Server state:** TanStack Query works in React Native exactly like on the web (`useQuery`, `useInfiniteQuery`); add `focusManager` with AppState so data refetches when the app returns to the foreground.\n\n**Lists and images:** FlatList with `numColumns={2}`, `onEndReached` for infinite scroll, `refreshControl` / `refreshing` + `onRefresh`, stable `keyExtractor`, memoised row components; `expo-image` for caching and placeholders.\n\nPlayground note: the playground runs react-native-web with only `react`, `react-native`, `expo-status-bar` and `react-native-safe-area-context`. React Navigation and AsyncStorage are simulated (a small stack/tab navigator with useState and an in-memory cart), and the `code` blocks contain the real Expo code.",
      syntax:
        "// src/cart/CartContext.js (real app)\nimport AsyncStorage from '@react-native-async-storage/async-storage';\n\nexport function CartProvider({ children }) {\n  const [state, dispatch] = useReducer(cartReducer, { items: [], hydrated: false });\n\n  useEffect(() => {\n    AsyncStorage.getItem('shopkart:cart')\n      .then((raw) => dispatch({ type: 'HYDRATE', items: raw ? JSON.parse(raw) : [] }))\n      .catch(() => dispatch({ type: 'HYDRATE', items: [] }));\n  }, []);\n\n  useEffect(() => {\n    if (state.hydrated) AsyncStorage.setItem('shopkart:cart', JSON.stringify(state.items));\n  }, [state]);\n  // ...value with addToCart, setQty, remove, clear, count, total\n}",
    },
    {
      heading: 'Mobile UX checklist and release with EAS',
      content:
        "**UX details interviewers notice:**\n- `SafeAreaView` / `useSafeAreaInsets()` so content avoids notches and the home indicator\n- `KeyboardAvoidingView` (behavior 'padding' on iOS) + `keyboardShouldPersistTaps=\"handled\"` on checkout forms\n- Correct keyboards: `keyboardType=\"phone-pad\"` for mobile, `\"number-pad\"` for PIN code, `autoComplete` hints\n- Touch targets at least 44×44, `hitSlop` for small icons, press feedback (`({ pressed }) => ...`)\n- `accessibilityRole=\"button\"`, `accessibilityLabel` for icon buttons, `accessibilityState={{ disabled }}`\n- Loading skeletons, error with Retry, empty states; offline banner using `@react-native-community/netinfo`\n- Sticky bottom bar on details (price + Add to cart) like real shopping apps\n\n**Release:**\n1. `app.json`: name, slug, `android.package` (com.yourname.shopkart), `ios.bundleIdentifier`, version, icon, splash\n2. `npm i -g eas-cli`, `eas login`, `eas build:configure`\n3. `eas build -p android --profile preview` → APK to share; `--profile production` → AAB for Play Store\n4. `eas submit -p android` uploads to the Play Console (internal testing track first)\n5. `eas update` ships JavaScript-only fixes over the air without a store review",
    },
    {
      heading: 'React Interview Masterclass: how to prepare and answer',
      content:
        "**What fresher/junior React interviews contain:**\n1. **JavaScript round:** closures, this, promises/async-await, event loop, array methods, destructuring, spread, debounce/throttle, deep vs shallow copy\n2. **React concepts:** JSX, components, props vs state, rendering and reconciliation, keys, hooks rules, useEffect lifecycle and cleanup, useMemo/useCallback/memo, context, reducers, refs, forms, routing, error boundaries, portals, Suspense/lazy, React 19 features\n3. **Machine coding (45-90 min):** todo app, search with debounce, pagination, star rating, accordion, modal, infinite scroll, OTP input, tabs, cart, weather card, multi-step form\n4. **Project discussion:** architecture, hardest bug, trade-offs, what you would improve\n5. **HR / behavioural**\n\n**Answer formula for concept questions:** definition in one line → why it exists → small example → common mistake or trade-off. Example: \"Keys help React match list items between renders. Without stable keys React may reuse the wrong DOM/state, e.g. an input keeps text after reordering. Use database ids, not indexes, when the list can change.\"\n\n**Explaining a project (STAR):** Situation (what the app does and for whom), Task (your responsibility), Action (stack, architecture, two interesting technical decisions such as URL filters or optimistic delete), Result (live link, Lighthouse score, what you learned). Practise a 2-minute version for Weather, ShopKart web and ShopKart mobile.\n\n**Machine coding tips:** clarify requirements first, build the simplest working version, then add loading/error/empty states, keyboard accessibility and clean component splits; think aloud; keep state minimal and derive the rest.",
      points: [
        'Have your GitHub, live links and APK link ready in your resume',
        'Revise Days 7, 13, 16-19, 22-25 (core hooks and state), Day 37 (TanStack Query), Day 41-42 (auth), Day 51-52 (React 19, performance)',
        'Practise 10 machine-coding problems with a 60-minute timer',
      ],
    },
    {
      heading: 'Final test: how it works',
      content:
        "The final test for the course has three parts:\n\n1. **Theory (this lesson):** read the 32 interview questions below and answer each aloud before reading the answer. Mark the ones you could not explain and revise those days.\n2. **Quiz:** the 5 MCQs at the end cover the most-missed concepts.\n3. **Practical:** the practice tasks below are the coding round: (a) wishlist + search for the mobile app, (b) a useFetch hook with abort and cache, (c) an OTP input component, (d) a star rating component with keyboard support, (e) the full project write-up. Time-box each to 45-60 minutes, exactly like a machine-coding round.\n\nPassing criteria you should hold yourself to: all three projects deployed (web link + APK), README for each with screenshots and demo accounts, and at least 28 of the 32 questions answered confidently.\n\nCongratulations on completing 60 days of React! Keep building: every new project and every bug you fix is interview material.",
    },
  ],
  examples: [
    {
      title: 'Feature 1: App shell with bottom tabs + stack (simulated navigator) and cart badge',
      scenario: 'Create the ShopKart Mobile shell: Home, Cart and Profile tabs, a stack inside Home (Home → ProductDetails) with a back button and a cart badge that updates from any screen.',
      steps: [
        'Install React Navigation and create RootStack, Tabs and HomeStack (see theory code)',
        'Create CartProvider above the navigators and read count for tabBarBadge',
        'Screens receive navigation and route props; navigate with params',
        'Playground: a tiny navigator keeps one stack per tab in state and passes the same navigation API',
        'Tap a product, add it to the cart, switch to Cart and back: Home keeps its stack',
        'Run npx expo start for the real app',
      ],
      code: `// screens/HomeScreen.js (real app)
export default function HomeScreen({ navigation }) {
  return (
    <FlatList
      data={products}
      keyExtractor={(p) => String(p.id)}
      renderItem={({ item }) => (
        <Pressable onPress={() => navigation.navigate('ProductDetails', { id: item.id })}>
          <Text>{item.title}</Text>
        </Pressable>
      )}
    />
  );
}

// screens/ProductDetailsScreen.js
export default function ProductDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const { addToCart } = useCart();
  // fetch product by id ...
  return (
    <Pressable onPress={() => { addToCart(product); navigation.navigate('Tabs', { screen: 'CartTab' }); }}>
      <Text>Add to cart</Text>
    </Pressable>
  );
}`,
      playground: {
        device: 'android',
        rn: `import { createContext, useContext, useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const PRODUCTS = [
  { id: 1, title: 'Wireless Earbuds', price: 1499, emoji: '🎧' },
  { id: 2, title: 'Smart Watch', price: 2999, emoji: '⌚' },
  { id: 3, title: 'Power Bank 20000mAh', price: 1299, emoji: '🔋' },
];

const CartContext = createContext(null);
const useCart = () => useContext(CartContext);

// ---- tiny tab + stack navigator (playground stand-in for React Navigation) ----
function useTabsWithStacks(tabs) {
  const [tab, setTab] = useState(tabs[0]);
  const [stacks, setStacks] = useState(Object.fromEntries(tabs.map((t) => [t, [{ name: t }]])));
  const stack = stacks[tab];
  const navigation = {
    navigate: (name, params) => {
      if (tabs.includes(name)) return setTab(name);
      setStacks((s) => ({ ...s, [tab]: [...s[tab], { name, params }] }));
    },
    goBack: () => setStacks((s) => ({ ...s, [tab]: s[tab].length > 1 ? s[tab].slice(0, -1) : s[tab] })),
  };
  return { tab, setTab, route: stack[stack.length - 1], canGoBack: stack.length > 1, navigation };
}

function HomeScreen({ navigation }) {
  return (
    <FlatList
      data={PRODUCTS}
      keyExtractor={(p) => String(p.id)}
      contentContainerStyle={{ padding: 12, gap: 10 }}
      renderItem={({ item }) => (
        <Pressable style={styles.row} onPress={() => navigation.navigate('ProductDetails', { id: item.id })}>
          <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>₹{item.price.toLocaleString('en-IN')}</Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </Pressable>
      )}
    />
  );
}

function ProductDetailsScreen({ route, navigation }) {
  const product = PRODUCTS.find((p) => p.id === route.params.id);
  const { add } = useCart();
  return (
    <View style={styles.center}>
      <Text style={{ fontSize: 96 }}>{product.emoji}</Text>
      <Text style={styles.bigTitle}>{product.title}</Text>
      <Text style={styles.price}>₹{product.price.toLocaleString('en-IN')}</Text>
      <Pressable style={styles.btn} onPress={() => add(product.id)}><Text style={styles.btnText}>Add to cart</Text></Pressable>
      <Pressable style={[styles.btn, styles.secondary]} onPress={() => { add(product.id); navigation.navigate('Cart'); }}>
        <Text style={[styles.btnText, { color: '#2563eb' }]}>Buy now</Text>
      </Pressable>
    </View>
  );
}

function CartScreen() {
  const { cart, count } = useCart();
  const lines = PRODUCTS.filter((p) => cart[p.id]);
  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.bigTitle}>Cart ({count})</Text>
      {lines.length === 0 && <Text style={styles.muted}>Your cart is empty</Text>}
      {lines.map((p) => <Text key={p.id} style={styles.line}>{p.emoji} {p.title} × {cart[p.id]}</Text>)}
    </View>
  );
}

function ProfileScreen() {
  return <View style={styles.center}><Text style={{ fontSize: 60 }}>👩🏽‍💼</Text><Text style={styles.bigTitle}>Ananya Rao</Text><Text style={styles.muted}>Hyderabad</Text></View>;
}

const SCREENS = { Home: HomeScreen, ProductDetails: ProductDetailsScreen, Cart: CartScreen, Profile: ProfileScreen };
const TABS = [['Home', '🏠'], ['Cart', '🛒'], ['Profile', '👤']];

export default function App() {
  const [cart, setCart] = useState({});
  const count = Object.values(cart).reduce((s, q) => s + q, 0);
  const add = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const { tab, route, canGoBack, navigation } = useTabsWithStacks(TABS.map(([t]) => t));
  const Screen = SCREENS[route.name];

  return (
    <CartContext.Provider value={{ cart, count, add }}>
      <View style={styles.app}>
        <StatusBar style="light" />
        <View style={styles.header}>
          {canGoBack ? <Pressable onPress={navigation.goBack} hitSlop={10}><Text style={styles.headerText}>←</Text></Pressable> : <Text style={styles.headerText}>🛍</Text>}
          <Text style={styles.headerTitle}>{route.name === 'ProductDetails' ? 'Product' : route.name === 'Home' ? 'ShopKart' : route.name}</Text>
        </View>
        <View style={{ flex: 1 }}><Screen route={route} navigation={navigation} /></View>
        <View style={styles.tabBar}>
          {TABS.map(([name, icon]) => (
            <Pressable key={name} style={styles.tab} onPress={() => navigation.navigate(name)} accessibilityRole="button" accessibilityLabel={name + ' tab'}>
              <View>
                <Text style={{ fontSize: 20, opacity: tab === name ? 1 : 0.5 }}>{icon}</Text>
                {name === 'Cart' && count > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>}
              </View>
              <Text style={[styles.tabLabel, tab === name && styles.tabActive]}>{name}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </CartContext.Provider>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { height: 52, backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 14 },
  headerText: { color: '#fff', fontSize: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 14, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '600' },
  price: { color: '#16a34a', fontWeight: '700', fontSize: 16, marginTop: 2 },
  chev: { fontSize: 24, color: '#94a3b8' },
  center: { flex: 1, alignItems: 'center', padding: 24, gap: 6 },
  bigTitle: { fontSize: 22, fontWeight: '800' },
  btn: { alignSelf: 'stretch', backgroundColor: '#f59e0b', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  secondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#2563eb' },
  btnText: { color: '#fff', fontWeight: '700' },
  muted: { color: '#64748b', marginTop: 8 },
  line: { fontSize: 16, marginTop: 8 },
  tabBar: { height: 62, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, color: '#94a3b8' },
  tabActive: { color: '#2563eb', fontWeight: '700' },
  badge: { position: 'absolute', top: -4, right: -12, backgroundColor: '#ef4444', borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});`,
      },
      result: 'A blue header, three products and a bottom tab bar. Tapping a product opens its details with a ← back arrow. "Add to cart" puts a red badge on the Cart tab; "Buy now" also switches to the Cart tab. Going back to Home still shows the details screen you left, because each tab keeps its own stack.',
      explanation:
        "useTabsWithStacks models what React Navigation does internally: one stack array per tab plus a navigation object with navigate and goBack. Screens are written exactly like real React Navigation screens (navigation and route props), so moving to the real library is copy-paste. The cart lives in a context above all screens, which is why the badge in the tab bar and the details screen share the same data. Navigating to a tab name switches tabs, just like navigate('CartTab') in a nested navigator.",
    },
    {
      title: 'Feature 2: Home and product list with dummyjson, category chips, infinite scroll and pull to refresh',
      scenario: 'The Home screen loads categories and products from dummyjson into a 2-column FlatList with real images, filters by category chip, loads 10 more products when you reach the end and supports pull to refresh.',
      steps: [
        'Copy src/api/products.js from the web project (fetch with limit/skip/select)',
        'Store products, total, page state (loading, loadingMore, refreshing, error)',
        'FlatList numColumns={2}, ListHeaderComponent with search + chips, ListFooterComponent with a spinner',
        'onEndReached loads the next page only if not already loading and more items exist',
        'refreshing + onRefresh reloads the first page',
        'Changing a category resets the list',
      ],
      code: `// real app: TanStack Query useInfiniteQuery
import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE = 10;
export function useProductsInfinite(category) {
  return useInfiniteQuery({
    queryKey: ['products', category],
    queryFn: ({ pageParam, signal }) => fetchProducts({ category, skip: pageParam, limit: PAGE }, signal),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.skip + last.limit < last.total ? last.skip + last.limit : undefined),
  });
}

// HomeScreen
const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = useProductsInfinite(category);
const products = data?.pages.flatMap((p) => p.products) ?? [];

<FlatList
  data={products}
  numColumns={2}
  keyExtractor={(p) => String(p.id)}
  renderItem={({ item }) => <ProductCard product={item} onPress={() => navigation.navigate('ProductDetails', { id: item.id })} />}
  onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
  onEndReachedThreshold={0.5}
  refreshing={isRefetching}
  onRefresh={refetch}
  ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
/>`,
      playground: {
        device: 'ios',
        rn: `import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Pressable, ActivityIndicator, StyleSheet } from 'react-native';

const API = 'https://dummyjson.com';
const PAGE = 10;
const CATS = ['all', 'smartphones', 'laptops', 'fragrances', 'groceries', 'mens-watches', 'womens-bags'];
const inr = (usd) => '₹' + Math.round(usd * 85).toLocaleString('en-IN');

async function fetchProducts({ category, skip }) {
  const path = category === 'all' ? '/products' : '/products/category/' + category;
  const res = await fetch(API + path + '?limit=' + PAGE + '&skip=' + skip + '&select=title,price,discountPercentage,rating,thumbnail');
  if (!res.ok) throw new Error('Could not load products');
  return res.json();
}

export default function App() {
  const [category, setCategory] = useState('all');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');   // loading | idle | more | refreshing | error
  const [error, setError] = useState('');

  const load = useCallback(async (mode, skip) => {
    setStatus(mode); setError('');
    try {
      const data = await fetchProducts({ category, skip });
      setItems((prev) => (skip === 0 ? data.products : [...prev, ...data.products]));
      setTotal(data.total);
      setStatus('idle');
    } catch (e) {
      setError(e.message); setStatus('error');
    }
  }, [category]);

  useEffect(() => { setItems([]); load('loading', 0); }, [load]);

  const loadMore = () => {
    if (status !== 'idle' || items.length >= total) return;
    load('more', items.length);
  };

  const header = (
    <View>
      <View style={styles.banner}><Text style={styles.bannerText}>🎉 Big Billion Sale · Up to 70% off</Text></View>
      <FlatList
        horizontal
        data={CATS}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 10 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipOn]}>
            <Text style={[styles.chipText, category === item && { color: '#fff' }]}>{item.replace('-', ' ')}</Text>
          </Pressable>
        )}
      />
      <Text style={styles.count}>{total ? 'Showing ' + items.length + ' of ' + total : ' '}</Text>
    </View>
  );

  return (
    <View style={styles.app}>
      <View style={styles.header}><Text style={styles.logo}>🛍 ShopKart</Text></View>
      {status === 'error' && items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.err}>⚠ {error}</Text>
          <Pressable style={styles.retry} onPress={() => load('loading', 0)}><Text style={{ color: '#fff' }}>Retry</Text></Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(p) => String(p.id)}
          ListHeaderComponent={header}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 16 }}
          columnWrapperStyle={{ gap: 8 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshing={status === 'refreshing'}
          onRefresh={() => load('refreshing', 0)}
          ListEmptyComponent={status === 'loading' ? <ActivityIndicator size="large" style={{ marginTop: 40 }} /> : <Text style={styles.center}>No products</Text>}
          ListFooterComponent={
            status === 'more' ? <ActivityIndicator style={{ margin: 16 }} /> :
            items.length > 0 && items.length >= total ? <Text style={styles.end}>You have reached the end ✨</Text> :
            items.length > 0 ? <Pressable onPress={loadMore}><Text style={styles.end}>Load more ↓</Text></Pressable> : null
          }
          renderItem={({ item }) => (
            <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]} accessibilityRole="button" accessibilityLabel={item.title}>
              <Image source={{ uri: item.thumbnail }} style={styles.img} resizeMode="contain" />
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.price}>{inr(item.price * (1 - item.discountPercentage / 100))}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.rating}>{item.rating.toFixed(1)} ★</Text>
                <Text style={styles.off}>{Math.round(item.discountPercentage)}% off</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#2563eb', padding: 14 },
  logo: { color: '#fff', fontSize: 20, fontWeight: '800' },
  banner: { backgroundColor: '#fde68a', borderRadius: 12, padding: 14, marginTop: 10 },
  bannerText: { fontWeight: '700', color: '#92400e' },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1' },
  chipOn: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { textTransform: 'capitalize', color: '#334155' },
  count: { color: '#64748b', fontSize: 12, marginBottom: 6 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 8 },
  img: { width: '100%', height: 120, backgroundColor: '#f8fafc', borderRadius: 8 },
  title: { fontWeight: '600', marginTop: 6, minHeight: 36 },
  price: { fontWeight: '800', fontSize: 16, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4 },
  rating: { backgroundColor: '#16a34a', color: '#fff', fontSize: 11, paddingHorizontal: 5, borderRadius: 4 },
  off: { color: '#16a34a', fontSize: 12, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginTop: 40 },
  err: { color: '#b91c1c', marginBottom: 10 },
  retry: { backgroundColor: '#b91c1c', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 },
  end: { textAlign: 'center', color: '#64748b', margin: 16 },
});`,
      },
      result: 'An iPhone-style screen with a sale banner, scrollable category chips and a 2-column grid of real dummyjson products with images, ₹ prices, rating and % off. Scrolling to the bottom loads 10 more (spinner in the footer) until "You have reached the end ✨". Tapping a chip such as Laptops reloads the list for that category.',
      explanation:
        "One FlatList renders everything: the banner and chips go into ListHeaderComponent so the whole screen scrolls together and the list stays virtualised (no FlatList inside a ScrollView). A single status value prevents double loading: onEndReached can fire several times, but loadMore exits unless status is idle and more items exist. skip === 0 replaces the list (first page, refresh, new category) while other pages append. columnWrapperStyle adds the gap between the two columns. In the real app useInfiniteQuery manages pages, caching and refetching for you.",
    },
    {
      title: 'Feature 3: Product details + cart with useReducer (sticky Add to cart bar)',
      scenario: 'A details screen with an image carousel (horizontal paging FlatList with dots), price, rating, stock and description, a sticky bottom bar with the price and an Add to cart button, and a cart reducer shared through context.',
      steps: [
        'Fetch /products/:id in the details screen using route.params.id',
        'Image carousel: horizontal FlatList with pagingEnabled and onMomentumScrollEnd to update the dot',
        'Sticky bottom bar outside the ScrollView so it is always visible',
        'cartReducer (ADD, SET_QTY, REMOVE, CLEAR, HYDRATE) in CartProvider; AsyncStorage persistence in the real app',
        'Disable Add to cart when stock is 0 and show "Go to cart" after adding',
        'Run the playground and add a product twice',
      ],
      code: `// src/cart/cartReducer.js (shared with the web project + HYDRATE for AsyncStorage)
export function cartReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items, hydrated: true };
    case 'ADD': {
      const { product, qty = 1 } = action;
      const exists = state.items.some((l) => l.id === product.id);
      const items = exists
        ? state.items.map((l) => (l.id === product.id ? { ...l, qty: Math.min(l.qty + qty, l.stock) } : l))
        : [...state.items, { id: product.id, title: product.title, price: product.price, discountPercentage: product.discountPercentage, thumbnail: product.thumbnail, stock: product.stock, qty }];
      return { ...state, items };
    }
    case 'SET_QTY':
      return { ...state, items: action.qty <= 0 ? state.items.filter((l) => l.id !== action.id) : state.items.map((l) => (l.id === action.id ? { ...l, qty: Math.min(action.qty, l.stock) } : l)) };
    case 'REMOVE':
      return { ...state, items: state.items.filter((l) => l.id !== action.id) };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}`,
      playground: {
        device: 'android',
        rn: `import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { View, Text, ScrollView, FlatList, Image, Pressable, ActivityIndicator, useWindowDimensions, StyleSheet } from 'react-native';

const inr = (usd) => '₹' + Math.round(usd * 85).toLocaleString('en-IN');
const selling = (p) => p.price * (1 - p.discountPercentage / 100);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, qty = 1 } = action;
      const exists = state.items.some((l) => l.id === product.id);
      const items = exists
        ? state.items.map((l) => (l.id === product.id ? { ...l, qty: Math.min(l.qty + qty, l.stock) } : l))
        : [...state.items, { id: product.id, title: product.title, price: product.price, discountPercentage: product.discountPercentage, thumbnail: product.thumbnail, stock: product.stock, qty }];
      return { ...state, items };
    }
    case 'SET_QTY':
      return { ...state, items: action.qty <= 0 ? state.items.filter((l) => l.id !== action.id) : state.items.map((l) => (l.id === action.id ? { ...l, qty: Math.min(action.qty, l.stock) } : l)) };
    default:
      return state;
  }
}
const CartContext = createContext(null);
function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], hydrated: true }); // real app: hydrate from AsyncStorage
  const value = useMemo(() => ({
    items: state.items,
    count: state.items.reduce((s, l) => s + l.qty, 0),
    total: state.items.reduce((s, l) => s + selling(l) * l.qty, 0),
    addToCart: (product, qty) => dispatch({ type: 'ADD', product, qty }),
    setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
  }), [state.items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
const useCart = () => useContext(CartContext);

function ProductDetailsScreen({ route }) {
  const { width } = useWindowDimensions();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [slide, setSlide] = useState(0);
  const { addToCart, items } = useCart();
  const imgWidth = Math.min(width, 336);

  useEffect(() => {
    fetch('https://dummyjson.com/products/' + route.params.id)
      .then((r) => { if (!r.ok) throw new Error('Product not found'); return r.json(); })
      .then(setProduct)
      .catch((e) => setError(e.message));
  }, [route.params.id]);

  if (error) return <Text style={styles.err}>⚠ {error}</Text>;
  if (!product) return <ActivityIndicator size="large" style={{ marginTop: 80 }} />;
  const inCart = items.find((l) => l.id === product.id);
  const out = product.stock === 0;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <FlatList
          horizontal
          pagingEnabled
          data={product.images}
          keyExtractor={(u) => u}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / imgWidth))}
          renderItem={({ item }) => <Image source={{ uri: item }} style={{ width: imgWidth, height: 260 }} resizeMode="contain" />}
        />
        <View style={styles.dots}>
          {product.images.map((u, i) => <View key={u} style={[styles.dot, i === slide && styles.dotOn]} />)}
        </View>
        <View style={{ padding: 16 }}>
          <Text style={styles.brand}>{product.brand || product.category}</Text>
          <Text style={styles.title}>{product.title}</Text>
          <View style={styles.row}>
            <Text style={styles.rating}>{product.rating.toFixed(1)} ★</Text>
            <Text style={styles.muted}>{product.reviews.length} reviews</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.price}>{inr(selling(product))}</Text>
            <Text style={styles.mrp}>{inr(product.price)}</Text>
            <Text style={styles.off}>{Math.round(product.discountPercentage)}% off</Text>
          </View>
          <Text style={product.stock < 10 ? styles.low : styles.ok}>{out ? 'Out of stock' : product.stock < 10 ? 'Only ' + product.stock + ' left' : 'In stock'}</Text>
          <Text style={styles.desc}>{product.description}</Text>
          <Text style={styles.muted}>🚚 {product.shippingInformation} · 🛡 {product.warrantyInformation}</Text>
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.muted}>{inCart ? inCart.qty + ' in cart' : 'Price'}</Text>
          <Text style={styles.barPrice}>{inr(selling(product))}</Text>
        </View>
        <Pressable
          disabled={out || (inCart && inCart.qty >= product.stock)}
          onPress={() => addToCart(product, 1)}
          style={({ pressed }) => [styles.addBtn, (out || pressed) && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityState={{ disabled: out }}
        >
          <Text style={styles.addText}>{out ? 'Out of stock' : inCart ? 'Add one more' : 'Add to cart'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function App() {
  const [id, setId] = useState(123);
  return (
    <CartProvider>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.demo}>
          {[123, 78, 17, 9999].map((n) => (
            <Pressable key={n} onPress={() => setId(n)} style={[styles.demoBtn, id === n && styles.demoOn]}>
              <Text style={{ color: id === n ? '#fff' : '#1e293b' }}>#{n}</Text>
            </Pressable>
          ))}
          <CartCount />
        </View>
        <ProductDetailsScreen key={id} route={{ params: { id } }} />
      </View>
    </CartProvider>
  );
}

function CartCount() {
  const { count, total } = useCart();
  return <Text style={styles.cartCount}>🛒 {count} · {inr(total)}</Text>;
}

const styles = StyleSheet.create({
  demo: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, backgroundColor: '#e2e8f0' },
  demoBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#fff' },
  demoOn: { backgroundColor: '#2563eb' },
  cartCount: { marginLeft: 'auto', fontWeight: '700' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#cbd5e1' },
  dotOn: { backgroundColor: '#2563eb', width: 18 },
  brand: { color: '#2563eb', fontWeight: '700', textTransform: 'uppercase', fontSize: 12 },
  title: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  rating: { backgroundColor: '#16a34a', color: '#fff', paddingHorizontal: 6, borderRadius: 4, fontSize: 12 },
  price: { fontSize: 24, fontWeight: '800' },
  mrp: { color: '#94a3b8', textDecorationLine: 'line-through' },
  off: { color: '#16a34a', fontWeight: '700' },
  ok: { color: '#16a34a', marginTop: 6 },
  low: { color: '#ea580c', fontWeight: '700', marginTop: 6 },
  desc: { marginVertical: 10, color: '#334155', lineHeight: 20 },
  muted: { color: '#64748b', fontSize: 12 },
  err: { color: '#b91c1c', textAlign: 'center', marginTop: 60 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fff' },
  barPrice: { fontSize: 18, fontWeight: '800' },
  addBtn: { backgroundColor: '#f59e0b', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 10 },
  addText: { color: '#fff', fontWeight: '800' },
});`,
      },
      result: 'The iPhone 13 Pro (product #123) details: a swipeable image carousel with dots, brand, title, rating, ₹ price with MRP and % off, stock text, description and shipping info, plus a sticky bottom bar. "Add to cart" updates the cart counter at the top and changes to "Add one more" showing how many are in the cart. #9999 shows "Product not found".',
      explanation:
        "The bottom bar is a sibling of the ScrollView inside a flex: 1 column, so it is always visible like in shopping apps. The carousel uses a horizontal FlatList with pagingEnabled; dividing the scroll offset by the image width gives the current slide. The reducer now keeps { items, hydrated } so the real app can use HYDRATE after reading AsyncStorage and save only when hydrated. key={id} on the details screen resets the carousel and product state when a different product is opened, just as a new screen instance would in React Navigation.",
    },
    {
      title: 'Feature 4: Cart and Checkout screens with keyboard-friendly validation',
      scenario: 'A Cart screen with quantity steppers and a price summary, and a Checkout screen with name, mobile (phone-pad), PIN code (number-pad) and address, payment method chips, inline errors, and an order success screen that cannot be "backed" into.',
      steps: [
        'CartScreen: FlatList of lines with − / + and a summary footer (MRP, discount, delivery, total)',
        'Checkout: TextInputs with keyboardType, maxLength and returnKeyType="next"; focus the next input with refs',
        'Validate on submit; show errors under each field; disable Pay while placing the order',
        'Wrap the form in KeyboardAvoidingView + ScrollView keyboardShouldPersistTaps="handled" (real app)',
        'On success: clear the cart and navigation.reset to OrderSuccess',
        'Run the playground: try mobile 51234 and PIN 0000 first',
      ],
      code: `// screens/CheckoutScreen.js (real app)
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, Pressable, Text } from 'react-native';

export default function CheckoutScreen({ navigation }) {
  const { items, total, clear } = useCart();
  const mobileRef = useRef(null);
  const pinRef = useRef(null);
  const [form, setForm] = useState({ name: '', mobile: '', pincode: '', address: '', payment: 'upi' });
  const [placing, setPlacing] = useState(false);

  async function placeOrder() {
    // validate ... then
    setPlacing(true);
    try {
      const order = await createOrder({ items, address: form });   // same API as the web app
      clear();
      navigation.reset({ index: 0, routes: [{ name: 'OrderSuccess', params: { orderId: order.id } }] });
    } finally {
      setPlacing(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16 }}>
        <TextInput placeholder="Full name" returnKeyType="next" onSubmitEditing={() => mobileRef.current?.focus()} />
        <TextInput ref={mobileRef} keyboardType="phone-pad" maxLength={10} returnKeyType="next" onSubmitEditing={() => pinRef.current?.focus()} />
        <TextInput ref={pinRef} keyboardType="number-pad" maxLength={6} />
        <Pressable disabled={placing} onPress={placeOrder}><Text>{placing ? 'Placing…' : 'Pay'}</Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}`,
      playground: {
        device: 'ios',
        rn: `import { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, FlatList, ActivityIndicator, StyleSheet } from 'react-native';

const START = [
  { id: 1, title: 'boAt Airdopes 141', price: 1299, mrp: 4490, qty: 1, stock: 5, emoji: '🎧' },
  { id: 2, title: 'Cotton Kurta Set', price: 899, mrp: 1999, qty: 2, stock: 3, emoji: '👘' },
];
const inr = (n) => '₹' + n.toLocaleString('en-IN');
const RULES = {
  name: [(v) => v.trim().length >= 3, 'Enter your full name'],
  mobile: [(v) => /^[6-9]\\d{9}$/.test(v), 'Enter a valid 10-digit mobile number'],
  pincode: [(v) => /^[1-9]\\d{5}$/.test(v), 'Enter a valid 6-digit PIN code'],
  address: [(v) => v.trim().length >= 10, 'Address is too short'],
};

export default function App() {
  const [screen, setScreen] = useState('cart');     // cart | checkout | success
  const [items, setItems] = useState(START);
  const [orderId, setOrderId] = useState('');
  const setQty = (id, qty) => setItems((l) => (qty <= 0 ? l.filter((x) => x.id !== id) : l.map((x) => (x.id === id ? { ...x, qty: Math.min(qty, x.stock) } : x))));
  const mrp = items.reduce((s, l) => s + l.mrp * l.qty, 0);
  const total = items.reduce((s, l) => s + l.price * l.qty, 0);
  const delivery = total >= 499 || total === 0 ? 0 : 40;

  if (screen === 'success') {
    return (
      <View style={styles.success}>
        <Text style={{ fontSize: 72 }}>✅</Text>
        <Text style={styles.h1}>Order placed!</Text>
        <Text style={styles.muted}>Order id {orderId} · arriving in 3-5 days</Text>
        <Pressable style={styles.primary} onPress={() => { setItems(START); setScreen('cart'); }}><Text style={styles.primaryText}>Continue shopping</Text></Pressable>
      </View>
    );
  }

  if (screen === 'checkout') {
    return <Checkout total={total + delivery} onBack={() => setScreen('cart')} onSuccess={(id) => { setItems([]); setOrderId(id); setScreen('success'); }} />;
  }

  return (
    <View style={styles.app}>
      <Text style={styles.header}>My Cart ({items.reduce((s, l) => s + l.qty, 0)})</Text>
      <FlatList
        data={items}
        keyExtractor={(l) => String(l.id)}
        contentContainerStyle={{ padding: 12, gap: 10 }}
        ListEmptyComponent={<Text style={[styles.muted, { textAlign: 'center', marginTop: 40 }]}>Your cart is empty 🛒</Text>}
        renderItem={({ item }) => (
          <View style={styles.line}>
            <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text><Text style={styles.price}>{inr(item.price)}</Text>  <Text style={styles.mrp}>{inr(item.mrp)}</Text></Text>
              <View style={styles.stepper}>
                <Pressable style={styles.stepBtn} onPress={() => setQty(item.id, item.qty - 1)} accessibilityLabel={'Decrease ' + item.title}><Text style={styles.stepText}>−</Text></Pressable>
                <Text style={styles.qty}>{item.qty}</Text>
                <Pressable style={[styles.stepBtn, item.qty >= item.stock && { opacity: 0.3 }]} disabled={item.qty >= item.stock} onPress={() => setQty(item.id, item.qty + 1)} accessibilityLabel={'Increase ' + item.title}><Text style={styles.stepText}>+</Text></Pressable>
              </View>
            </View>
          </View>
        )}
      />
      {items.length > 0 && (
        <View style={styles.summary}>
          <Row label="Price (MRP)" value={inr(mrp)} />
          <Row label="Discount" value={'− ' + inr(mrp - total)} green />
          <Row label="Delivery" value={delivery ? inr(delivery) : 'FREE'} />
          <Row label="Total" value={inr(total + delivery)} bold />
          <Pressable style={styles.primary} onPress={() => setScreen('checkout')}><Text style={styles.primaryText}>Proceed to checkout</Text></Pressable>
        </View>
      )}
    </View>
  );
}

function Row({ label, value, green, bold }) {
  return (
    <View style={styles.sumRow}>
      <Text style={bold && styles.bold}>{label}</Text>
      <Text style={[bold && styles.bold, green && { color: '#16a34a' }]}>{value}</Text>
    </View>
  );
}

function Checkout({ total, onBack, onSuccess }) {
  const [form, setForm] = useState({ name: '', mobile: '', pincode: '', address: '', payment: 'upi' });
  const [tried, setTried] = useState(false);
  const [placing, setPlacing] = useState(false);
  const mobileRef = useRef(null);
  const pinRef = useRef(null);
  const addressRef = useRef(null);
  const errors = Object.fromEntries(Object.entries(RULES).filter(([k, [ok]]) => !ok(form[k])).map(([k, [, msg]]) => [k, msg]));
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: k === 'mobile' || k === 'pincode' ? v.replace(/\\D/g, '') : v }));

  function pay() {
    setTried(true);
    if (Object.keys(errors).length) return;
    setPlacing(true);
    setTimeout(() => onSuccess('SKM' + Date.now().toString().slice(-6)), 1200);   // createOrder() + payment
  }

  const input = (k, props) => (
    <View style={{ marginBottom: 10 }}>
      <TextInput style={[styles.input, tried && errors[k] && styles.inputErr]} value={form[k]} onChangeText={set(k)} placeholderTextColor="#94a3b8" {...props} />
      {tried && !!errors[k] && <Text style={styles.err}>{errors[k]}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.app} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Pressable onPress={onBack} hitSlop={10}><Text style={styles.link}>← Back to cart</Text></Pressable>
      <Text style={styles.h1}>Delivery address</Text>
      {input('name', { placeholder: 'Full name', returnKeyType: 'next', onSubmitEditing: () => mobileRef.current && mobileRef.current.focus() })}
      {input('mobile', { ref: mobileRef, placeholder: 'Mobile number', keyboardType: 'phone-pad', maxLength: 10, returnKeyType: 'next', onSubmitEditing: () => pinRef.current && pinRef.current.focus() })}
      {input('pincode', { ref: pinRef, placeholder: 'PIN code', keyboardType: 'number-pad', maxLength: 6, returnKeyType: 'next', onSubmitEditing: () => addressRef.current && addressRef.current.focus() })}
      {input('address', { ref: addressRef, placeholder: 'Flat, street, area, city', multiline: true })}
      <Text style={styles.h2}>Payment</Text>
      <View style={styles.payRow}>
        {[['upi', 'UPI'], ['card', 'Card'], ['cod', 'COD']].map(([k, l]) => (
          <Pressable key={k} onPress={() => setForm((f) => ({ ...f, payment: k }))} style={[styles.payChip, form.payment === k && styles.payOn]} accessibilityState={{ selected: form.payment === k }}>
            <Text style={{ color: form.payment === k ? '#fff' : '#1e293b' }}>{l}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={[styles.primary, placing && { opacity: 0.6 }]} disabled={placing} onPress={pay}>
        {placing ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{form.payment === 'cod' ? 'Place order' : 'Pay'} {inr(total)}</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { fontSize: 20, fontWeight: '800', padding: 16, backgroundColor: '#fff' },
  line: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', padding: 12, borderRadius: 12 },
  title: { fontWeight: '600' },
  price: { fontWeight: '800' },
  mrp: { color: '#94a3b8', textDecorationLine: 'line-through' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  stepBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 18, color: '#2563eb' },
  qty: { minWidth: 20, textAlign: 'center', fontWeight: '700' },
  summary: { backgroundColor: '#fff', padding: 16, gap: 6, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  bold: { fontWeight: '800', fontSize: 16 },
  primary: { backgroundColor: '#f59e0b', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10, minHeight: 48, justifyContent: 'center' },
  primaryText: { color: '#fff', fontWeight: '800' },
  h1: { fontSize: 22, fontWeight: '800', marginVertical: 10 },
  h2: { fontSize: 16, fontWeight: '700', marginTop: 6, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, minHeight: 46 },
  inputErr: { borderColor: '#dc2626' },
  err: { color: '#dc2626', fontSize: 12, marginTop: 3 },
  link: { color: '#2563eb' },
  payRow: { flexDirection: 'row', gap: 8 },
  payChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1' },
  payOn: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  muted: { color: '#64748b' },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f0fdf4', gap: 6 },
});`,
      },
      result: 'A cart with two lines, − / + steppers (capped at stock), and a summary with MRP, discount, FREE delivery and total. "Proceed to checkout" opens the address form; pressing Pay with empty or wrong fields shows red errors (letters are stripped from mobile and PIN). With valid data the button shows a spinner and then a green "Order placed!" screen with an order id.',
      explanation:
        "Errors are derived from form values and displayed after the first submit attempt. Refs and returnKeyType=\"next\" move the focus through the inputs like native apps, and keyboardType gives the phone or number pad. The success screen replaces the checkout entirely; in React Navigation you do the same with navigation.reset so the Back button cannot return to a paid checkout. Disabling the Pay button while placing the order prevents double charges, the same rule as on the web.",
    },
    {
      title: 'Complete mobile app: ShopKart Mobile (Home → List → Details → Cart → Checkout)',
      scenario: 'The whole app in one App.js for the playground: tabs (Home, Cart, Profile) with per-tab stacks, live dummyjson products with search and category chips, product details, a shared cart with badge, checkout with validation and an order success screen, plus an orders list on Profile.',
      steps: [
        'Combine the navigator stand-in, CartProvider and the screens from features 1-4',
        'Home: search (submit to /products/search), category chips, 2-column grid',
        'Details: fetch by id, Add to cart, Buy now (goes to the Cart tab)',
        'Cart → Checkout (hides the tab bar like a modal) → OrderSuccess (stack reset)',
        'Profile shows the orders placed in this session (AsyncStorage + API in the real app)',
        'Real app: replace the stand-ins with React Navigation + AsyncStorage and run eas build -p android --profile preview',
      ],
      code: `// Real project structure
ShopKartMobile/
├─ App.js                     // CartProvider + NavigationContainer + RootStack
├─ app.json                   // name, android.package, icon, splash
├─ eas.json                   // build profiles: development, preview (apk), production (aab)
└─ src/
   ├─ api/products.js         // same as web
   ├─ cart/cartReducer.js  CartContext.js (AsyncStorage)
   ├─ navigation/RootStack.js  Tabs.js  HomeStack.js
   ├─ screens/HomeScreen.js  ProductListScreen.js  ProductDetailsScreen.js
   │          CartScreen.js  CheckoutScreen.js  OrderSuccessScreen.js  ProfileScreen.js
   └─ components/ProductCard.js  QtyStepper.js  PriceSummary.js  ErrorState.js

// eas.json
{
  "build": {
    "preview": { "android": { "buildType": "apk" } },
    "production": {}
  }
}`,
      playground: {
        device: 'android',
        rn: `import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { View, Text, TextInput, FlatList, ScrollView, Image, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const API = 'https://dummyjson.com';
const FIELDS = 'title,price,discountPercentage,rating,thumbnail,stock';
const CATS = ['all', 'smartphones', 'laptops', 'mens-shirts', 'womens-dresses', 'groceries', 'sunglasses'];
const inr = (usd) => '₹' + Math.round(usd * 85).toLocaleString('en-IN');
const selling = (p) => p.price * (1 - p.discountPercentage / 100);

/* ---------- cart ---------- */
function cartReducer(items, a) {
  switch (a.type) {
    case 'ADD': {
      const p = a.product;
      if (items.some((l) => l.id === p.id)) return items.map((l) => (l.id === p.id ? { ...l, qty: Math.min(l.qty + 1, l.stock) } : l));
      return [...items, { id: p.id, title: p.title, price: p.price, discountPercentage: p.discountPercentage, thumbnail: p.thumbnail, stock: p.stock, qty: 1 }];
    }
    case 'SET_QTY': return a.qty <= 0 ? items.filter((l) => l.id !== a.id) : items.map((l) => (l.id === a.id ? { ...l, qty: Math.min(a.qty, l.stock) } : l));
    case 'CLEAR': return [];
    default: return items;
  }
}
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

/* ---------- data hook ---------- */
function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [n, setN] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error('Something went wrong (' + r.status + ')'); return r.json(); })
      .then((data) => alive && setState({ data, loading: false, error: '' }))
      .catch((e) => alive && setState({ data: null, loading: false, error: e.message }));
    return () => { alive = false; };
  }, [url, n]);
  return { ...state, retry: () => setN((x) => x + 1) };
}

function Loading() { return <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 60 }} />; }
function ErrorState({ message, onRetry }) {
  return (
    <View style={s.center}>
      <Text style={s.err}>⚠ {message}</Text>
      <Pressable style={s.smallBtn} onPress={onRetry}><Text style={s.smallBtnText}>Retry</Text></Pressable>
    </View>
  );
}

/* ---------- screens ---------- */
function HomeScreen({ navigation }) {
  const [cat, setCat] = useState('all');
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const url = q ? API + '/products/search?q=' + encodeURIComponent(q) + '&limit=20&select=' + FIELDS
    : cat === 'all' ? API + '/products?limit=20&skip=100&select=' + FIELDS
    : API + '/products/category/' + cat + '?limit=20&select=' + FIELDS;
  const { data, loading, error, retry } = useFetch(url);

  const header = (
    <View>
      <View style={s.searchRow}>
        <TextInput style={s.search} value={text} onChangeText={setText} placeholder="🔍 Search products" returnKeyType="search" onSubmitEditing={() => setQ(text.trim())} />
        {!!q && <Pressable onPress={() => { setQ(''); setText(''); }}><Text style={s.link}>Clear</Text></Pressable>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
        {CATS.map((c) => (
          <Pressable key={c} onPress={() => { setCat(c); setQ(''); setText(''); }} style={[s.chip, cat === c && !q && s.chipOn]}>
            <Text style={[s.chipText, cat === c && !q && { color: '#fff' }]}>{c.replace('-', ' ')}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={s.section}>{q ? 'Results for "' + q + '"' : cat === 'all' ? 'Top picks for you' : cat.replace('-', ' ')}</Text>
    </View>
  );

  if (error) return <ErrorState message={error} onRetry={retry} />;
  return (
    <FlatList
      data={loading ? [] : data.products}
      numColumns={2}
      keyExtractor={(p) => String(p.id)}
      ListHeaderComponent={header}
      ListEmptyComponent={loading ? <Loading /> : <Text style={s.empty}>No products found</Text>}
      contentContainerStyle={{ padding: 10 }}
      columnWrapperStyle={{ gap: 8 }}
      renderItem={({ item }) => (
        <Pressable style={s.card} onPress={() => navigation.navigate('Details', { id: item.id })}>
          <Image source={{ uri: item.thumbnail }} style={s.cardImg} resizeMode="contain" />
          <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={s.cardPrice}>{inr(selling(item))}</Text>
          <Text style={s.cardMeta}>{item.rating.toFixed(1)} ★ · {Math.round(item.discountPercentage)}% off</Text>
        </Pressable>
      )}
    />
  );
}

function DetailsScreen({ route, navigation }) {
  const { data: p, loading, error, retry } = useFetch(API + '/products/' + route.params.id);
  const { cart, dispatch } = useApp();
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  const line = cart.find((l) => l.id === p.id);
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Image source={{ uri: p.images[0] || p.thumbnail }} style={s.hero} resizeMode="contain" />
        <Text style={s.brand}>{p.brand || p.category}</Text>
        <Text style={s.h1}>{p.title}</Text>
        <Text style={s.cardMeta}>{p.rating.toFixed(1)} ★ · {p.reviews.length} reviews · {p.availabilityStatus}</Text>
        <Text style={s.bigPrice}>{inr(selling(p))} <Text style={s.mrp}>{inr(p.price)}</Text></Text>
        <Text style={s.desc}>{p.description}</Text>
        <Text style={s.muted}>🚚 {p.shippingInformation}</Text>
      </ScrollView>
      <View style={s.bar}>
        <Pressable style={[s.barBtn, s.barAlt]} disabled={p.stock === 0} onPress={() => dispatch({ type: 'ADD', product: p })}>
          <Text style={s.barAltText}>{line ? 'In cart (' + line.qty + ')' : 'Add to cart'}</Text>
        </Pressable>
        <Pressable style={s.barBtn} disabled={p.stock === 0} onPress={() => { if (!line) dispatch({ type: 'ADD', product: p }); navigation.navigate('Cart'); }}>
          <Text style={s.barText}>Buy now</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CartScreen({ navigation }) {
  const { cart, dispatch, totals } = useApp();
  if (!cart.length) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 56 }}>🛒</Text>
        <Text style={s.h1}>Your cart is empty</Text>
        <Pressable style={s.smallBtn} onPress={() => navigation.navigate('Home')}><Text style={s.smallBtnText}>Shop now</Text></Pressable>
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={cart}
        keyExtractor={(l) => String(l.id)}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        renderItem={({ item }) => (
          <View style={s.line}>
            <Image source={{ uri: item.thumbnail }} style={{ width: 60, height: 60 }} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.cardPrice}>{inr(selling(item) * item.qty)}</Text>
              <View style={s.stepper}>
                <Pressable style={s.step} onPress={() => dispatch({ type: 'SET_QTY', id: item.id, qty: item.qty - 1 })}><Text style={s.stepText}>−</Text></Pressable>
                <Text style={{ fontWeight: '700' }}>{item.qty}</Text>
                <Pressable style={s.step} onPress={() => dispatch({ type: 'SET_QTY', id: item.id, qty: item.qty + 1 })}><Text style={s.stepText}>+</Text></Pressable>
              </View>
            </View>
          </View>
        )}
      />
      <View style={s.summary}>
        <View style={s.sumRow}><Text>Discount</Text><Text style={{ color: '#16a34a' }}>− {inr(totals.mrp - totals.subtotal)}</Text></View>
        <View style={s.sumRow}><Text>Delivery</Text><Text>{totals.delivery ? '₹' + totals.delivery : 'FREE'}</Text></View>
        <View style={s.sumRow}><Text style={s.bold}>Total</Text><Text style={s.bold}>{'₹' + totals.payable.toLocaleString('en-IN')}</Text></View>
        <Pressable style={s.cta} onPress={() => navigation.navigate('Checkout')}><Text style={s.barText}>Checkout</Text></Pressable>
      </View>
    </View>
  );
}

function CheckoutScreen({ navigation }) {
  const { totals, dispatch, addOrder, cart } = useApp();
  const [f, setF] = useState({ name: '', mobile: '', pincode: '', address: '' });
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const errs = {};
  if (f.name.trim().length < 3) errs.name = 'Enter your full name';
  if (!/^[6-9]\\d{9}$/.test(f.mobile)) errs.mobile = 'Enter a valid 10-digit mobile';
  if (!/^[1-9]\\d{5}$/.test(f.pincode)) errs.pincode = 'Enter a valid 6-digit PIN code';
  if (f.address.trim().length < 10) errs.address = 'Address is too short';
  const field = (k, ph, extra) => (
    <View style={{ marginBottom: 10 }}>
      <TextInput style={[s.input, tried && errs[k] && { borderColor: '#dc2626' }]} placeholder={ph} value={f[k]}
        onChangeText={(v) => setF((x) => ({ ...x, [k]: k === 'mobile' || k === 'pincode' ? v.replace(/\\D/g, '') : v }))} {...extra} />
      {tried && !!errs[k] && <Text style={s.errSmall}>{errs[k]}</Text>}
    </View>
  );
  async function place() {
    setTried(true);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await fetch(API + '/carts/add', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 16, products: cart.map((l) => ({ id: l.id, quantity: l.qty })) }) });
      const server = await res.json();
      const id = 'SKM' + server.id + '-' + Date.now().toString().slice(-4);
      addOrder({ id, total: totals.payable, items: server.totalQuantity, city: f.pincode });
      dispatch({ type: 'CLEAR' });
      navigation.reset('OrderSuccess', { id });
    } catch (e) {
      setBusy(false);
    }
  }
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Text style={s.h1}>Delivery details</Text>
      {field('name', 'Full name')}
      {field('mobile', 'Mobile number', { keyboardType: 'phone-pad', maxLength: 10 })}
      {field('pincode', 'PIN code', { keyboardType: 'number-pad', maxLength: 6 })}
      {field('address', 'Flat, street, area, city', { multiline: true })}
      <Text style={s.bold}>Pay {'₹' + totals.payable.toLocaleString('en-IN')} via UPI (test)</Text>
      <Pressable style={[s.cta, busy && { opacity: 0.6 }]} disabled={busy} onPress={place}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.barText}>Place order</Text>}
      </Pressable>
    </ScrollView>
  );
}

function OrderSuccessScreen({ route, navigation }) {
  return (
    <View style={[s.center, { backgroundColor: '#f0fdf4' }]}>
      <Text style={{ fontSize: 72 }}>🎉</Text>
      <Text style={s.h1}>Order placed!</Text>
      <Text style={s.muted}>Order id {route.params.id}</Text>
      <Pressable style={s.smallBtn} onPress={() => navigation.reset('Home')}><Text style={s.smallBtnText}>Continue shopping</Text></Pressable>
    </View>
  );
}

function ProfileScreen() {
  const { orders } = useApp();
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={s.h1}>👩🏽 Ananya Rao</Text>
      <Text style={s.muted}>ananya@example.com · Hyderabad</Text>
      <Text style={[s.section, { marginTop: 16 }]}>My orders</Text>
      {orders.length === 0 && <Text style={s.muted}>No orders yet</Text>}
      {orders.map((o) => (
        <View key={o.id} style={s.line}>
          <Text style={{ flex: 1, fontWeight: '700' }}>{o.id}</Text>
          <Text>{o.items} items · {'₹' + o.total.toLocaleString('en-IN')}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

/* ---------- navigator stand-in (React Navigation in the real app) ---------- */
const SCREENS = { Home: HomeScreen, Details: DetailsScreen, Cart: CartScreen, Profile: ProfileScreen, Checkout: CheckoutScreen, OrderSuccess: OrderSuccessScreen };
const TITLES = { Home: 'ShopKart', Details: 'Product', Cart: 'My Cart', Profile: 'Profile', Checkout: 'Checkout', OrderSuccess: '' };
const TABS = [['Home', '🏠'], ['Cart', '🛒'], ['Profile', '👤']];

export default function App() {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('Home');
  const [stacks, setStacks] = useState({ Home: [{ name: 'Home' }], Cart: [{ name: 'Cart' }], Profile: [{ name: 'Profile' }] });

  const totals = useMemo(() => {
    const mrp = cart.reduce((x, l) => x + l.price * l.qty, 0);
    const subtotal = cart.reduce((x, l) => x + selling(l) * l.qty, 0);
    const delivery = subtotal * 85 >= 499 || !cart.length ? 0 : 40;
    return { mrp, subtotal, delivery, payable: Math.round(subtotal * 85) + delivery, count: cart.reduce((x, l) => x + l.qty, 0) };
  }, [cart]);

  const stack = stacks[tab];
  const route = stack[stack.length - 1];
  const navigation = {
    navigate: (name, params) => {
      if (stacks[name] && name !== tab) { setTab(name); return; }
      if (stacks[name]) { setStacks((st) => ({ ...st, [name]: [st[name][0]] })); return; }
      setStacks((st) => ({ ...st, [tab]: [...st[tab], { name, params }] }));
    },
    goBack: () => setStacks((st) => ({ ...st, [tab]: st[tab].length > 1 ? st[tab].slice(0, -1) : st[tab] })),
    reset: (name, params) => {
      if (stacks[name]) { setStacks((st) => ({ ...st, [tab]: [st[tab][0]], [name]: [{ name }] })); setTab(name); return; }
      setStacks((st) => ({ ...st, [tab]: [{ name, params }] }));
    },
  };
  const Screen = SCREENS[route.name];
  const modal = route.name === 'Checkout' || route.name === 'OrderSuccess';
  const ctx = { cart, dispatch, totals, orders, addOrder: (o) => setOrders((l) => [o, ...l]) };

  return (
    <AppContext.Provider value={ctx}>
      <View style={s.app}>
        <StatusBar style="light" />
        {route.name !== 'OrderSuccess' && (
          <View style={s.header}>
            {stack.length > 1 ? <Pressable onPress={navigation.goBack} hitSlop={12}><Text style={s.headerIcon}>←</Text></Pressable> : null}
            <Text style={s.headerTitle}>{TITLES[route.name]}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}><Screen key={stack.length + route.name} route={route} navigation={navigation} /></View>
        {!modal && (
          <View style={s.tabBar}>
            {TABS.map(([name, icon]) => (
              <Pressable key={name} style={s.tab} onPress={() => navigation.navigate(name)} accessibilityRole="button" accessibilityLabel={name}>
                <View>
                  <Text style={{ fontSize: 20, opacity: tab === name ? 1 : 0.45 }}>{icon}</Text>
                  {name === 'Cart' && totals.count > 0 && <View style={s.badge}><Text style={s.badgeText}>{totals.count}</Text></View>}
                </View>
                <Text style={[s.tabLabel, tab === name && { color: '#2563eb', fontWeight: '700' }]}>{name}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </AppContext.Provider>
  );
}

const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { height: 52, backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16 },
  headerIcon: { color: '#fff', fontSize: 22 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  search: { flex: 1, height: 42, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12 },
  link: { color: '#2563eb', fontWeight: '600' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1' },
  chipOn: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { textTransform: 'capitalize', fontSize: 13 },
  section: { fontWeight: '800', fontSize: 16, marginBottom: 6, textTransform: 'capitalize' },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 8, marginBottom: 8 },
  cardImg: { width: '100%', height: 110 },
  cardTitle: { fontWeight: '600', marginTop: 4 },
  cardPrice: { fontWeight: '800', marginTop: 2 },
  cardMeta: { color: '#16a34a', fontSize: 12, marginTop: 2 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 30 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  err: { color: '#b91c1c', textAlign: 'center' },
  errSmall: { color: '#dc2626', fontSize: 12, marginTop: 2 },
  smallBtn: { backgroundColor: '#2563eb', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  smallBtnText: { color: '#fff', fontWeight: '700' },
  hero: { width: '100%', height: 240, backgroundColor: '#f8fafc', borderRadius: 12 },
  brand: { color: '#2563eb', fontWeight: '700', textTransform: 'uppercase', fontSize: 12, marginTop: 10 },
  h1: { fontSize: 20, fontWeight: '800', marginVertical: 4 },
  bigPrice: { fontSize: 24, fontWeight: '800', marginTop: 8 },
  mrp: { fontSize: 14, color: '#94a3b8', textDecorationLine: 'line-through', fontWeight: '400' },
  desc: { color: '#334155', marginVertical: 10, lineHeight: 20 },
  muted: { color: '#64748b' },
  bar: { flexDirection: 'row', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fff' },
  barBtn: { flex: 1, backgroundColor: '#f59e0b', padding: 14, borderRadius: 10, alignItems: 'center' },
  barAlt: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#2563eb' },
  barText: { color: '#fff', fontWeight: '800' },
  barAltText: { color: '#2563eb', fontWeight: '800' },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', padding: 10, borderRadius: 12, marginBottom: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  step: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center' },
  stepText: { color: '#2563eb', fontSize: 18 },
  summary: { backgroundColor: '#fff', padding: 14, gap: 6, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  bold: { fontWeight: '800', fontSize: 16 },
  cta: { backgroundColor: '#f59e0b', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8, minHeight: 48, justifyContent: 'center' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, minHeight: 46 },
  tabBar: { height: 60, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, color: '#94a3b8' },
  badge: { position: 'absolute', top: -4, right: -12, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});`,
      },
      result: 'A complete shopping app in the phone frame: search and category chips over a 2-column grid of real products; tapping a product opens details with "Add to cart" and "Buy now"; the Cart tab shows a red badge, steppers and the total; Checkout hides the tab bar, validates the address and places the order (dummyjson /carts/add); the success screen leads back to Home, and the order appears under Profile → My orders.',
      explanation:
        "This single file contains the same architecture as the real project: data fetching with loading/error/retry, one cart reducer in a context above every screen, derived totals with useMemo, and a navigator with per-tab stacks plus a reset for the post-payment screen (the real equivalent is navigation.reset in React Navigation). Checkout and OrderSuccess hide the tab bar like a modal stack screen. To ship it, move each screen into src/screens, swap the stand-in navigator for React Navigation, add AsyncStorage hydration to the cart, and build an APK with EAS.",
    },
  ],
  interview: [
    { q: 'What is React and why is it popular?', a: "React is a JavaScript library for building user interfaces from reusable components. It is declarative (you describe the UI for a given state and React updates the DOM), component-based, has a huge ecosystem (Router, TanStack Query, Next.js, React Native) and lets one team build web and mobile apps.", level: 'Easy' },
    { q: 'What is the Virtual DOM and how does reconciliation work?', a: "React keeps a lightweight tree of elements. On a state change it renders a new tree, diffs it with the previous one (reconciliation) and applies the minimum DOM changes. Heuristics: elements of different types replace the subtree; same type updates props; keys identify list items across renders. Fiber splits this work into units so React can pause and prioritise updates.", level: 'Medium' },
    { q: 'What is JSX? Can the browser run it?', a: "JSX is syntax sugar that looks like HTML inside JavaScript. A compiler (Babel, esbuild/Vite) turns <h1 className=\"t\">Hi</h1> into jsx('h1', { className: 't', children: 'Hi' }) calls. Browsers cannot run JSX directly.", level: 'Easy' },
    { q: 'Props vs state?', a: "Props are inputs passed from a parent; they are read-only for the child. State is data owned by a component that changes over time with a setter, triggering a re-render. When two components need the same state, lift it to their closest common parent and pass it down as props.", level: 'Easy' },
    { q: 'Why are keys important in lists, and why not use the index?', a: "Keys let React match items between renders. With index keys, inserting or reordering items makes React reuse the wrong component instance, so local state (like input text or a checkbox) jumps to another row, and performance suffers. Use stable unique ids from the data.", level: 'Easy' },
    { q: 'Why must state be updated immutably?', a: "React compares the old and new state by reference (Object.is). Mutating an array/object keeps the same reference, so React may skip the re-render, and memoised children or effects will not see the change. Create new objects/arrays with spread, map, filter.", level: 'Easy' },
    { q: 'What is the difference between controlled and uncontrolled components?', a: "Controlled inputs get their value from React state and update it on change (single source of truth, easy validation). Uncontrolled inputs keep their value in the DOM and you read it with a ref or FormData (less re-rendering; React Hook Form uses this approach).", level: 'Easy' },
    { q: 'Explain useEffect, the dependency array and cleanup.', a: "useEffect runs side effects after render. No array: after every render; []: once after mount; [a, b]: when a or b change. The returned cleanup runs before the next effect and on unmount, used to clear timers, remove listeners and abort fetches. In development StrictMode runs effects twice to reveal missing cleanups.", level: 'Medium' },
    { q: 'What are the Rules of Hooks?', a: "Call hooks only at the top level of React function components or custom hooks, never inside loops, conditions or nested functions, so React can match hook calls to their stored state by call order. The eslint-plugin-react-hooks enforces this (React 19's use() is the exception that may be called conditionally).", level: 'Easy' },
    { q: 'useMemo vs useCallback vs React.memo?', a: "useMemo caches a computed value, useCallback caches a function reference, and React.memo skips re-rendering a component when its props are shallow-equal. They are optimisations: use them for expensive calculations or to keep props stable for memoised children, not everywhere. The React Compiler can add this memoisation automatically.", level: 'Medium' },
    { q: 'What does useRef do?', a: "It returns a mutable object { current } that persists across renders without causing re-renders. Used for DOM access (focus an input, measure size), storing timers/previous values and keeping the latest callback. In React 19 ref can be passed as a normal prop to function components.", level: 'Easy' },
    { q: 'When do you use Context, and what are its drawbacks?', a: "Context passes data deep without prop drilling: theme, auth user, language, cart. Every consumer re-renders when the value changes, so keep contexts focused, memoise the value, split state and dispatch, or use a store like Zustand/Redux for frequently changing global state.", level: 'Medium' },
    { q: 'useState vs useReducer?', a: "useState for independent simple values; useReducer when the next state depends on the previous one in several ways or many fields change together (cart, forms, wizards). A reducer centralises transitions in a pure, testable function, and dispatch is stable.", level: 'Medium' },
    { q: 'What is a custom hook? Give an example from your projects.', a: "A function starting with use that calls other hooks to reuse stateful logic. In my projects: useDebounce (search), useLocalStorage (favourites, cart), useWeather/useProducts (fetching with loading/error/abort) and useCart (context access with a helpful error).", level: 'Easy' },
    { q: 'Context API vs Redux Toolkit vs Zustand: how do you choose?', a: "Context for low-frequency global values (auth, theme). Zustand for simple global client state with selective subscriptions and almost no boilerplate. Redux Toolkit for large teams/apps needing strict patterns, middleware, devtools time travel and RTK Query. Server data belongs in TanStack Query or RTK Query, not in a global store.", level: 'Medium' },
    { q: 'Why use TanStack Query instead of useEffect + fetch?', a: "It handles caching by query key, deduplication, background refetch, stale times, retries, pagination/infinite queries, mutations with invalidation and optimistic updates, and avoids race conditions. Hand-written effects repeat this logic and often miss edge cases.", level: 'Medium' },
    { q: 'How does React Router work? How do you protect routes?', a: "BrowserRouter uses the History API; Routes picks the best matching Route; Link changes the URL without reloading; useParams/useSearchParams/useNavigate read and change the location; nested routes render inside <Outlet />. Protected routes use a layout route that checks auth and returns <Navigate to=\"/login\" replace state={{ from }} /> or <Outlet />.", level: 'Medium' },
    { q: 'What are code splitting and lazy loading?', a: "Splitting the bundle into chunks loaded on demand: const Admin = lazy(() => import('./Admin')) wrapped in <Suspense fallback>. Route-level splitting is the biggest win because users download only the pages they visit.", level: 'Easy' },
    { q: 'What are Error Boundaries and what can they not catch?', a: "Class components (or react-error-boundary) that catch rendering errors in their subtree and show fallback UI. They do not catch errors in event handlers, async code (setTimeout, promises) or server-side rendering, and not errors in the boundary itself; handle those with try/catch and error state.", level: 'Medium' },
    { q: 'What is a Portal and when do you use it?', a: "createPortal(children, domNode) renders children into another DOM node (e.g. document.body) while keeping them in the React tree (context and events still bubble through React). Used for modals, toasts, tooltips and dropdowns that must escape overflow: hidden or z-index stacking.", level: 'Medium' },
    { q: 'What is new in React 19?', a: "Actions (async functions in transitions) with useActionState, useFormStatus and useOptimistic; form action prop; the use() API to read promises and context; ref as a regular prop; <title>/<meta> rendered from components; better hydration errors; Server Components and Server Actions in frameworks; and the React Compiler for automatic memoisation.", level: 'Medium' },
    { q: 'How do you optimise a slow React app?', a: "Measure first (React Profiler, Lighthouse, Web Vitals). Then: avoid unnecessary re-renders (state colocation, memo, stable props), virtualise long lists, debounce expensive input work, code-split routes, lazy-load images with fixed dimensions, cache server data, reduce bundle size (analyse, tree-shake, replace heavy libraries) and use useTransition/useDeferredValue for non-urgent updates.", level: 'Hard' },
    { q: 'How do you prevent XSS in React?', a: "React escapes values rendered in JSX by default. Danger points: dangerouslySetInnerHTML (sanitise with DOMPurify), javascript: URLs in href, and third-party scripts. Also use a Content Security Policy and avoid storing tokens where scripts can read them.", level: 'Medium' },
    { q: 'How do you test React components?', a: "Vitest/Jest + React Testing Library: render, find elements by role/label like a user, interact with user-event, assert visible results; mock APIs with MSW; test hooks and reducers as plain functions; and cover critical flows end-to-end with Playwright.", level: 'Medium' },
    { q: 'What is the difference between React and React Native?', a: "Same React core (components, hooks, state). React DOM renders HTML to the browser; React Native renders native views on Android/iOS. RN has no DOM or CSS: View/Text/Image/Pressable, StyleSheet with Flexbox (column default), FlatList for lists, React Navigation instead of React Router, AsyncStorage instead of localStorage.", level: 'Easy' },
    { q: 'How did you structure navigation in ShopKart Mobile?', a: "A root native stack containing the bottom tabs, a Checkout screen presented as a modal and an OrderSuccess screen. Home has its own stack (Home → ProductList → ProductDetails). The cart provider wraps everything so the tab badge and all screens share the cart; after paying I call navigation.reset so Back cannot return to checkout.", level: 'Medium' },
    { q: 'How do you persist state in React Native and what is the hydration problem?', a: "AsyncStorage is async, so the first render starts with an empty cart. I load it in an effect and dispatch HYDRATE, and I only save after hydration; otherwise the initial empty array would overwrite the saved cart. Sensitive tokens go to expo-secure-store instead.", level: 'Hard' },
    { q: 'How do you make long lists fast in React Native?', a: "FlatList (or FlashList) instead of map in ScrollView, stable keyExtractor, memoised row components and renderItem, getItemLayout for fixed-height rows, tuned windowSize/initialNumToRender, optimised images (expo-image with caching and proper sizes) and paging with onEndReached.", level: 'Hard' },
    { q: 'What is SSR/SSG and when would you choose Next.js over Vite?', a: "SSR renders HTML on the server per request; SSG builds HTML at build time. They improve first paint and SEO. Choose Next.js (or React Router framework mode) for public, SEO-critical sites like e-commerce product pages and blogs; choose Vite SPA for dashboards and apps behind login.", level: 'Medium' },
    { q: 'Explain one of your final projects in two minutes.', a: "Example: \"ShopKart is an e-commerce web app built with React, React Router and Context + useReducer on the dummyjson API. I owned the whole front end. Two decisions I am proud of: filters live in the URL so results are shareable and refresh-safe, and the cart is a pure reducer with derived totals persisted to localStorage. Part 2 adds JWT auth with role-based routes, a validated checkout, a Razorpay test-mode payment flow verified on the server, and an admin dashboard with optimistic delete. It is deployed on Vercel with CI, and I also built the mobile version with Expo.\"", level: 'Medium' },
    { q: 'What was the hardest bug in your projects and how did you fix it?', a: "A good answer names a real problem, how you found it and what you learned. Example: \"In the weather app, switching cities quickly sometimes showed the wrong city. Logging showed responses arriving out of order. I fixed it by aborting the previous request with AbortController in the effect cleanup, and later noted TanStack Query solves it by keying data per city.\"", level: 'Medium' },
    { q: 'How would you design the front end of a large e-commerce site (system design)?', a: "Framework with SSR/SSG for product and category pages (SEO, fast LCP), SPA navigation after load; feature-based modules; server state via TanStack Query with caching; cart in a small store synced to the backend for logged-in users; CDN for images with responsive sizes; search service for typo-tolerant search and facets; design system and Storybook; analytics, A/B tests and feature flags; monitoring (Sentry, Web Vitals); CI with tests; accessibility and performance budgets.", level: 'Hard' },
  ],
  practice: [
    {
      task: 'Mobile coding round: add a Wishlist to ShopKart Mobile. A ♡ button on each product card toggles it in a WishlistContext; the Profile tab shows wishlist items with "Move to cart". (Real app: persist with AsyncStorage using the HYDRATE pattern.)',
      hint: 'Store ids in an array. Toggle with list.includes(id) ? filter : [...list, id]. Move to cart = dispatch ADD then remove from wishlist.',
      solution: `import { createContext, useContext, useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';

const PRODUCTS = [
  { id: 1, title: 'Running Shoes', price: 2499, emoji: '👟' },
  { id: 2, title: 'Backpack', price: 1299, emoji: '🎒' },
  { id: 3, title: 'Sunglasses', price: 999, emoji: '🕶️' },
];
const WishlistContext = createContext(null);

function WishlistProvider({ children }) {
  const [ids, setIds] = useState([]);
  const toggle = (id) => setIds((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const remove = (id) => setIds((l) => l.filter((x) => x !== id));
  return <WishlistContext.Provider value={{ ids, toggle, remove }}>{children}</WishlistContext.Provider>;
}
const useWishlist = () => useContext(WishlistContext);

function Products() {
  const { ids, toggle } = useWishlist();
  return (
    <FlatList
      data={PRODUCTS}
      keyExtractor={(p) => String(p.id)}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={{ flex: 1 }}>{item.emoji} {item.title} · ₹{item.price}</Text>
          <Pressable onPress={() => toggle(item.id)} accessibilityLabel={'Wishlist ' + item.title}>
            <Text style={{ fontSize: 22, color: '#e11d48' }}>{ids.includes(item.id) ? '♥' : '♡'}</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

function WishlistScreen({ cart, setCart }) {
  const { ids, remove } = useWishlist();
  return (
    <View>
      <Text style={styles.h}>Wishlist ({ids.length}) · Cart ({cart.length})</Text>
      {PRODUCTS.filter((p) => ids.includes(p.id)).map((p) => (
        <View key={p.id} style={styles.row}>
          <Text style={{ flex: 1 }}>{p.emoji} {p.title}</Text>
          <Pressable onPress={() => { setCart((c) => [...c, p.id]); remove(p.id); }}><Text style={{ color: '#2563eb' }}>Move to cart</Text></Pressable>
        </View>
      ))}
    </View>
  );
}

export default function App() {
  const [cart, setCart] = useState([]);
  return (
    <WishlistProvider>
      <View style={{ flex: 1, padding: 16 }}>
        <Products />
        <WishlistScreen cart={cart} setCart={setCart} />
      </View>
    </WishlistProvider>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8 },
  h: { fontWeight: '800', fontSize: 16, marginVertical: 10 },
});`,
    },
    {
      task: 'Machine coding: write a reusable useFetch(url, { ttl }) hook with loading/error/data, AbortController, an in-memory cache with a time-to-live, and a refetch function. Show it with a list of dummyjson users.',
      hint: 'Keep a module-level Map: url → { time, data }. If cached and Date.now() - time < ttl, return it immediately without fetching.',
      solution: `const { useState, useEffect, useCallback } = React;

const cache = new Map();

function useFetch(url, { ttl = 60000 } = {}) {
  const cached = cache.get(url);
  const fresh = cached && Date.now() - cached.time < ttl;
  const [state, setState] = useState({ data: fresh ? cached.data : null, loading: !fresh, error: null });
  const [version, setVersion] = useState(0);
  const refetch = useCallback(() => { cache.delete(url); setVersion((v) => v + 1); }, [url]);

  useEffect(() => {
    const hit = cache.get(url);
    if (hit && Date.now() - hit.time < ttl) { setState({ data: hit.data, loading: false, error: null }); return; }
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fetch(url, { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then((data) => { cache.set(url, { time: Date.now(), data }); setState({ data, loading: false, error: null }); })
      .catch((e) => { if (e.name !== 'AbortError') setState({ data: null, loading: false, error: e.message }); });
    return () => controller.abort();
  }, [url, ttl, version]);

  return { ...state, refetch };
}

function Users({ limit }) {
  const { data, loading, error, refetch } = useFetch('https://dummyjson.com/users?limit=' + limit + '&select=firstName,lastName,email', { ttl: 30000 });
  if (loading) return <p>Loading…</p>;
  if (error) return <p>⚠ {error} <button onClick={refetch}>Retry</button></p>;
  return (
    <div>
      <button onClick={refetch}>Refetch</button>
      <ul>{data.users.map((u) => <li key={u.id}>{u.firstName} {u.lastName} · {u.email}</li>)}</ul>
    </div>
  );
}

function App() {
  const [limit, setLimit] = useState(5);
  return (
    <div>
      <button onClick={() => setLimit(5)}>5 users</button> <button onClick={() => setLimit(10)}>10 users</button>
      <p><small>Switching back to a list you already loaded is instant (cache hit).</small></p>
      <Users limit={limit} />
    </div>
  );
}`,
    },
    {
      task: 'Machine coding: build a 6-digit OTP input. Typing a digit moves focus to the next box, Backspace on an empty box moves back, pasting "482913" fills all boxes, and a Verify button is enabled only when all 6 digits are present.',
      hint: 'Keep an array of 6 strings in state and an array of refs. Use onKeyDown for Backspace and onPaste with e.clipboardData.getData("text").',
      solution: `const { useState, useRef } = React;

function OtpInput({ length = 6, onComplete }) {
  const [digits, setDigits] = useState(Array(length).fill(''));
  const refs = useRef([]);

  function setAt(i, value) {
    const next = [...digits];
    next[i] = value;
    setDigits(next);
    if (next.every(Boolean)) onComplete(next.join(''));
  }
  function onChange(i, e) {
    const d = e.target.value.replace(/\\D/g, '').slice(-1);
    setAt(i, d);
    if (d && i < length - 1) refs.current[i + 1].focus();
  }
  function onKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1].focus();
  }
  function onPaste(e) {
    const text = e.clipboardData.getData('text').replace(/\\D/g, '').slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = Array.from({ length }, (_, i) => text[i] || '');
    setDigits(next);
    refs.current[Math.min(text.length, length - 1)].focus();
    if (next.every(Boolean)) onComplete(next.join(''));
  }

  return (
    <div style={{ display: 'flex', gap: 8 }} onPaste={onPaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          onChange={(e) => onChange(i, e)}
          onKeyDown={(e) => onKeyDown(i, e)}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={'Digit ' + (i + 1)}
          style={{ width: 40, height: 48, textAlign: 'center', fontSize: 22 }}
        />
      ))}
    </div>
  );
}

function App() {
  const [code, setCode] = useState('');
  return (
    <div>
      <p>Enter the OTP sent to +91 98XXXXXX10</p>
      <OtpInput onComplete={setCode} />
      <button disabled={code.length !== 6} style={{ marginTop: 12 }} onClick={() => console.log('Verify', code)}>Verify</button>
    </div>
  );
}`,
    },
    {
      task: 'Machine coding: build an accessible StarRating component (1-5) with hover preview, click to select, keyboard support (arrow keys change the value) and a read-only mode.',
      hint: 'Use role="radiogroup" with five buttons role="radio" aria-checked. Track hover in state and display hover || value.',
      solution: `const { useState } = React;

function StarRating({ value, onChange, readOnly = false, max = 5 }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  function onKeyDown(e) {
    if (readOnly) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(max, value + 1)); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(1, value - 1)); }
  }
  return (
    <div role="radiogroup" aria-label="Rating" onKeyDown={onKeyDown} onMouseLeave={() => setHover(0)} style={{ display: 'inline-flex' }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          role="radio"
          aria-checked={value === n}
          aria-label={n + ' star' + (n > 1 ? 's' : '')}
          tabIndex={readOnly ? -1 : value === n || (!value && n === 1) ? 0 : -1}
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(n)}
          onClick={() => onChange(n)}
          style={{ background: 'none', border: 0, fontSize: 28, cursor: readOnly ? 'default' : 'pointer', color: n <= shown ? '#f59e0b' : '#cbd5e1' }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function App() {
  const [rating, setRating] = useState(0);
  return (
    <div>
      <StarRating value={rating} onChange={setRating} />
      <p>{rating ? 'You rated ' + rating + '/5' : 'Tap a star or use the arrow keys'}</p>
      <p>Read-only: <StarRating value={4} onChange={() => {}} readOnly /></p>
    </div>
  );
}`,
    },
    {
      task: 'Final assignment: write the README for your three final projects (Weather, ShopKart web, ShopKart mobile) and a 2-minute project pitch for each. Include features, tech stack, architecture, decisions, demo accounts, links and what you would improve.',
      hint: 'Use headings: Overview, Live demo, Features, Tech stack, Architecture, Key decisions, Getting started, Demo accounts, Screenshots, Future improvements. Keep the pitch in the STAR format.',
      solution: `# ShopKart: E-commerce web + mobile (React 19, React Native/Expo)

## Live demo
- Web: https://shopkart-yourname.vercel.app
- Android APK: https://expo.dev/accounts/yourname/projects/shopkart-mobile/builds/...
- Demo accounts: user averyp / averyppass · admin emilys / emilyspass (dummyjson.com)

## Features
- Product grid with categories, debounced search, sort, price filter (all stored in the URL)
- Product details with gallery, stock and reviews
- Cart with Context + useReducer, persisted (localStorage on web, AsyncStorage on mobile)
- JWT login, auto-login, protected and admin-only routes
- Checkout with React Hook Form + Zod (Indian mobile and PIN code validation)
- Razorpay test-mode payment flow with server-side signature verification (design)
- Orders history, admin dashboard with KPIs, Recharts sales chart and product CRUD (optimistic delete)

## Tech stack
React 19 · Vite 6 · React Router 7 · TanStack Query 5 · React Hook Form + Zod · Recharts · Vitest + RTL + MSW · Playwright
Mobile: Expo SDK 52 · React Native 0.76 · React Navigation 7 · AsyncStorage · EAS Build

## Architecture
src/api (service layer) · src/features/{products,cart,auth,checkout,orders,admin} · src/components (shared UI) · src/hooks · src/utils
Server state: TanStack Query · URL state: useSearchParams · Global client state: CartContext + useReducer · Auth: AuthContext

## Key decisions
1. Filters in the URL: shareable, refresh-safe, back-button friendly
2. Cart reducer is pure and tested; totals are derived, never stored
3. Client sends only ids and quantities; prices are calculated on the server
4. Route-level code splitting; images lazy-loaded with fixed aspect ratio (CLS ≈ 0)

## Getting started
npm install
cp .env.example .env.local
npm run dev

## Future improvements
SSR for product pages (Next.js) · real backend with inventory · Razorpay webhooks · offline cart sync · E2E tests in CI for checkout

---
2-minute pitch (STAR)
S: Shoppers need a fast store that works on web and phone.
T: I built the complete front end for web and mobile as my final project.
A: React + React Router with URL-driven filters, a reducer-based cart, JWT auth with role-based routes, validated checkout, a Razorpay test flow and an admin dashboard; then reused the API and cart logic in an Expo app with tabs + stack navigation.
R: Deployed on Vercel with CI and an Android APK via EAS; Lighthouse 95+; I learned how to separate server, URL and client state and how to design secure payment flows.`,
    },
  ],
  quiz: [
    {
      question: 'In ShopKart Mobile, why is Checkout placed in the root stack instead of inside a tab?',
      options: ['Tabs cannot contain forms', 'So it opens above the tabs (hiding the tab bar) like a modal flow', 'React Navigation does not allow stacks inside tabs', 'To make the app load faster'],
      answer: 1,
      explanation: 'Screens in the root stack are presented over the tab navigator, which suits focused flows like checkout and payment.',
    },
    {
      question: 'What problem does the HYDRATE action solve when persisting the cart with AsyncStorage?',
      options: ['It encrypts the cart', 'It makes AsyncStorage synchronous', 'It prevents the empty initial cart from overwriting the saved cart before loading finishes', 'It sends the cart to the server'],
      answer: 2,
      explanation: 'Load first, mark hydrated, and only then start saving changes.',
    },
    {
      question: 'Which statement about keys in React lists is correct?',
      options: ['Keys must be stable and unique among siblings; array indexes break when items are reordered or inserted', 'Keys are passed to the component as props.key', 'Keys must be globally unique in the whole app', 'Keys are only needed in React Native'],
      answer: 0,
      explanation: 'Keys identify items between renders among siblings; the component cannot read key as a prop.',
    },
    {
      question: 'Which tool is the best fit for caching server data such as product lists?',
      options: ['useState in App', 'A global Context with the whole API response', 'localStorage', 'TanStack Query (useQuery / useInfiniteQuery)'],
      answer: 3,
      explanation: 'Server state needs caching, deduplication, refetching and invalidation, which TanStack Query provides.',
    },
    {
      question: 'Which of these is NOT caught by an Error Boundary?',
      options: ['An error thrown while rendering a child', 'An error thrown inside an onClick handler', 'An error in a child component\'s render because of undefined data', 'An error thrown in a lazy component while rendering'],
      answer: 1,
      explanation: 'Error boundaries catch render/lifecycle errors in their subtree, not errors in event handlers or async code.',
    },
  ],
};
