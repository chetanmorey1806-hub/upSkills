export default {
  id: 'day-56-react-native-with-expo',
  title: 'React Native with Expo: Core Components, StyleSheet, Flexbox, Lists, Expo Go and React Navigation Basics',
  module: 'Module 12: React Native & Final Projects',
  day: 56,
  level: 'Intermediate',
  duration: '3 hours',
  summary:
    "React Native lets you use the React you already know to build real Android and iOS apps. Today you set up a project with Expo (SDK 52, React Native 0.76), learn the core components (View, Text, Image, ScrollView, TextInput, Pressable, FlatList), style them with StyleSheet and Flexbox, run the app on your own phone with Expo Go and move between screens with React Navigation.",
  objectives: [
    'Explain how React Native differs from React for the web and why companies choose Expo',
    'Create an Expo project and run it on a real phone with Expo Go',
    'Build screens with View, Text, Image, ScrollView, TextInput, Pressable and FlatList',
    'Style components with StyleSheet.create and Flexbox (column by default)',
    'Navigate between screens with React Navigation (native stack and bottom tabs) and pass params',
  ],
  theory: [
    {
      heading: 'What is React Native and what is Expo?',
      content:
        "**React Native (RN)** is a framework by Meta that lets you write mobile apps in JavaScript/React. Your components are rendered as **real native views** (an Android `android.view.View`, an iOS `UIView`), not as HTML inside a browser. That is why RN apps feel native: native scrolling, native text inputs, native gestures.\n\nAnalogy: React is the **chef** (the recipe for describing UI with components, props, state and hooks). React DOM serves the dish on a **web plate** (HTML), React Native serves the same recipe on a **mobile plate** (native views).\n\n**Expo** is the toolkit built around React Native that the React Native team itself recommends for new apps. It gives you:\n- `create-expo-app` to start a project in one command\n- **Expo Go**, a phone app that runs your code instantly by scanning a QR code (no Android Studio / Xcode needed to start)\n- A large set of ready modules: `expo-location`, `expo-camera`, `expo-image-picker`, `expo-notifications`, `expo-secure-store`\n- **EAS Build / EAS Submit** to build the .apk/.aab/.ipa in the cloud and send it to the Play Store and App Store\n- **Expo Router** (file-based routing, like Next.js) in the default template\n\nCurrent versions used in this course: **Expo SDK 52** with **React Native 0.76**, where the **New Architecture** (JSI, Fabric renderer, TurboModules) is on by default. The old \"bridge\" that serialised every message to JSON is gone, so JS can call native code directly and faster.\n\nCompanies using React Native: Meta (Facebook, Instagram), Microsoft (Office, Teams parts), Shopify, Discord, and in India Flipkart (parts), Swiggy-style delivery apps, many fintech and ed-tech startups. One React team can ship web + Android + iOS.",
      points: [
        'Same React: components, props, state, hooks, Context, custom hooks all work unchanged',
        'Different primitives: no div/span/p/img/button; use View, Text, Image, Pressable',
        'Expo = React Native + tooling + native modules + cloud builds',
        'React Native 0.76 + Expo SDK 52: New Architecture enabled by default',
      ],
      tip: 'Interviewers often ask "Is React Native a WebView?" No. Ionic/Cordova apps render HTML inside a WebView. React Native renders platform-native UI components.',
    },
    {
      heading: 'Setting up a project and running it on your phone with Expo Go',
      content:
        "Requirements: Node.js 18+ (LTS 20/22 recommended), VS Code, and the **Expo Go** app from the Play Store / App Store on your phone.\n\n1. Create the project: `npx create-expo-app@latest my-app` (default template with Expo Router and TypeScript) or `npx create-expo-app@latest my-app --template blank` (a single App.js, best for learning today).\n2. `cd my-app` and start the dev server: `npx expo start`\n3. A **QR code** appears in the terminal. Android: open Expo Go and scan it. iPhone: scan it with the Camera app.\n4. Your phone and laptop must be on the **same Wi-Fi**. On office or college Wi-Fi that blocks devices, use `npx expo start --tunnel`.\n5. Edit App.js and save: **Fast Refresh** updates the phone in about a second while keeping state.\n\nUseful keys in the terminal: `a` opens the Android emulator, `i` the iOS simulator (macOS only), `w` the web version, `r` reloads, `j` opens the debugger.\n\nWhen you need a native library that is not in Expo Go, you create a **development build** (`npx expo install expo-dev-client` then `eas build --profile development`). For the Play Store: `eas build -p android` creates an .aab.",
      syntax:
        "npx create-expo-app@latest ShopKart --template blank\ncd ShopKart\nnpx expo start          # scan the QR code with Expo Go\n\n# add libraries with expo install (picks versions compatible with your SDK)\nnpx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context",
      tip: 'Always install React Native libraries with `npx expo install <pkg>` instead of `npm install`. It chooses the version that matches your Expo SDK, avoiding the classic "works on web, crashes on phone" version mismatch.',
    },
    {
      heading: 'Core components: the HTML you know mapped to React Native',
      content:
        "React Native has no DOM, so HTML tags do not exist. Every UI is built from a few core components imported from `react-native`:\n\n- `<View>` = `<div>`: a box for layout\n- `<Text>` = `<p>`, `<span>`, `<h1>`: **every string must be inside a Text**. Writing text directly inside a View crashes the app with \"Text strings must be rendered within a <Text> component\"\n- `<Image source={{ uri: '...' }} />` = `<img>`: remote images **need a width and height**; local images use `source={require('./assets/logo.png')}`\n- `<ScrollView>` = a scrollable div. Screens do NOT scroll by default in RN\n- `<TextInput>` = `<input>`: use `value` + `onChangeText` (gives you the string directly, not an event)\n- `<Pressable>` = `<button>`: use `onPress` (there is no onClick). Also `onLongPress` and a `style` function that receives `{ pressed }`\n- `<FlatList>` = an efficient list that only renders the rows visible on screen (virtualised)\n- Others: `ActivityIndicator` (spinner), `Switch` (toggle), `Modal`, `SafeAreaView`, `KeyboardAvoidingView`, `RefreshControl`\n\nEvents are also different: `onPress`, `onChangeText`, `onSubmitEditing`, `onEndReached`, `onRefresh`.",
      syntax:
        "import { View, Text, Image, Pressable } from 'react-native';\n\nexport default function App() {\n  return (\n    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>\n      <Image source={{ uri: 'https://picsum.photos/id/64/200' }} style={{ width: 100, height: 100, borderRadius: 50 }} />\n      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Priya Sharma</Text>\n      <Pressable onPress={() => console.log('pressed')}>\n        <Text>Follow</Text>\n      </Pressable>\n    </View>\n  );\n}",
      tip: 'Common beginner crash: `<View>Hello</View>` or `{count}` directly inside a View. Wrap it: `<Text>{count}</Text>`. Another one: `{items.length && <List />}` renders 0 as a raw string when the list is empty; use `items.length > 0 && ...`.',
    },
    {
      heading: 'Styling with StyleSheet and Flexbox',
      content:
        "There is no CSS file in React Native. Styles are **JavaScript objects** with camelCase names: `backgroundColor`, `fontSize`, `borderRadius`, `paddingHorizontal`.\n\n- Use `StyleSheet.create({...})` to define styles once, outside the component (validated in development and easier to read)\n- Numbers have **no units**: `padding: 16` means 16 density-independent pixels (dp), so it looks the same size on every screen density\n- Combine styles with an array: `style={[styles.btn, isActive && styles.active]}` (later entries win, falsy entries are ignored)\n- **No cascade, no class names, no selectors**. Text styles are inherited only by nested `<Text>` inside a `<Text>`\n\n**Flexbox is the only layout system**, and it is on by default for every View. Differences from the web:\n- `flexDirection` defaults to **'column'** (web default is row)\n- `alignContent` defaults to 'flex-start', `flexShrink` defaults to 0\n- `flex: 1` means \"take all the remaining space\". The root View usually has `flex: 1` so it fills the screen\n- `gap`, `rowGap`, `columnGap` are supported (RN 0.71+)\n- Percentages work (`width: '48%'`); for the screen size use `useWindowDimensions()`\n\nPlatform differences: `Platform.OS === 'ios'` or `Platform.select({ ios: {...}, android: {...} })`. Shadows: `shadowColor/shadowOpacity/shadowRadius` on iOS, `elevation` on Android (RN 0.76 also supports `boxShadow`).",
      syntax:
        "const styles = StyleSheet.create({\n  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },\n  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },\n  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6 },\n  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },\n});",
      tip: 'fontWeight must be a string ("700", "bold"), not a number. Inline objects like style={{ margin: 10 }} are fine for one-offs, but put repeated styles in StyleSheet.create for readability.',
    },
    {
      heading: 'Lists, scrolling and user input',
      content:
        "**ScrollView** renders **all** children at once. Perfect for a profile page or a form, bad for 1,000 products (memory and speed).\n\n**FlatList** renders only what is on screen plus a small buffer, recycling memory as you scroll. Required props:\n- `data`: the array\n- `renderItem={({ item, index }) => ...}`: note it receives an object, destructure `item`\n- `keyExtractor={(item) => String(item.id)}`: keys must be **strings**\n\nUseful extras: `numColumns={2}` (grid), `horizontal`, `ItemSeparatorComponent`, `ListHeaderComponent`, `ListEmptyComponent`, `onEndReached` + `onEndReachedThreshold` (infinite scroll), `refreshing` + `onRefresh` (pull to refresh). Use `SectionList` for grouped data (contacts A-Z). Shopify's **FlashList** is a faster drop-in replacement used in production.\n\n**TextInput** props: `value`, `onChangeText`, `placeholder`, `keyboardType` ('numeric', 'email-address', 'phone-pad'), `secureTextEntry` (passwords), `autoCapitalize='none'` (emails), `maxLength`, `multiline`, `returnKeyType`, `onSubmitEditing`. Wrap forms in `KeyboardAvoidingView` so the keyboard does not cover the inputs on iOS.",
      tip: 'Never put a FlatList inside a ScrollView with the same direction (you get the "VirtualizedLists should never be nested" warning and lose virtualisation). Use ListHeaderComponent / ListFooterComponent for content above and below the list instead.',
    },
    {
      heading: 'React Navigation basics (and Expo Router)',
      content:
        "A mobile app has no URL bar, so navigation is a **stack of screens** (push a screen, go back) and **tabs** at the bottom. The standard library is **React Navigation 7**:\n\n- `NavigationContainer` wraps the whole app (holds navigation state)\n- `createNativeStackNavigator()` gives `Stack.Navigator` and `Stack.Screen` (native iOS/Android transitions and back gesture)\n- `createBottomTabNavigator()` gives tabs like Home / Cart / Profile\n- Every screen receives `navigation` and `route` props (or use the `useNavigation()` / `useRoute()` hooks)\n- `navigation.navigate('Details', { id: 5 })` opens a screen with params, `route.params.id` reads them, `navigation.goBack()` goes back, `navigation.setOptions({ title })` changes the header\n- Nesting: a Tab navigator as one screen of a Stack navigator (or a stack inside each tab) is the most common real-world structure\n\n**Expo Router** (the default in `create-expo-app`) is built on top of React Navigation but uses **files as routes**: `app/index.tsx` is `/`, `app/product/[id].tsx` is a dynamic route, `app/(tabs)/_layout.tsx` defines tabs, and you navigate with `<Link href=\"/product/5\">` or `router.push()`. It also gives deep links for free.\n\nPlayground note: the playground runs your App.js in a phone frame using react-native-web. It supports imports from `react`, `react-native`, `expo-status-bar` and `react-native-safe-area-context`; the playgrounds use emoji in a `<Text>` where a real app would use `@expo/vector-icons`. React Navigation is not available there, so the navigation playground below simulates a stack with useState, while `code` shows the real React Navigation version for your Expo project.\n\nComing next: Day 57 builds a complete Weather app for the web and for mobile.",
      syntax:
        "import { NavigationContainer } from '@react-navigation/native';\nimport { createNativeStackNavigator } from '@react-navigation/native-stack';\n\nconst Stack = createNativeStackNavigator();\n\nexport default function App() {\n  return (\n    <NavigationContainer>\n      <Stack.Navigator>\n        <Stack.Screen name=\"Home\" component={HomeScreen} />\n        <Stack.Screen name=\"Details\" component={DetailsScreen} options={{ title: 'Product' }} />\n      </Stack.Navigator>\n    </NavigationContainer>\n  );\n}\n\nfunction HomeScreen({ navigation }) {\n  return <Button title=\"Open\" onPress={() => navigation.navigate('Details', { id: 5 })} />;\n}",
    },
  ],
  examples: [
    {
      title: 'Profile card: View, Text, Image and StyleSheet',
      scenario: 'Build the profile header of a social app for "Aarav Mehta, Frontend Developer, Pune" with a photo, stats row and a Follow button that toggles.',
      steps: [
        'npx create-expo-app@latest ProfileApp --template blank and open App.js',
        'Import View, Text, Image, Pressable and StyleSheet from react-native',
        'Give the remote Image a width, height and borderRadius (half the width for a circle)',
        'Build the stats row with flexDirection: "row" and justifyContent: "space-around"',
        'Store "following" in useState and change the button style with a style array',
        'Run npx expo start, scan the QR code with Expo Go (or click Run in the playground)',
      ],
      code: `import { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [following, setFollowing] = useState(false);
  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://picsum.photos/id/64/300' }} style={styles.avatar} />
      <Text style={styles.name}>Aarav Mehta</Text>
      <Text style={styles.role}>Frontend Developer · Pune</Text>
      <View style={styles.stats}>
        <Stat value="128" label="Posts" />
        <Stat value={following ? '2,501' : '2,500'} label="Followers" />
        <Stat value="310" label="Following" />
      </View>
      <Pressable
        onPress={() => setFollowing(!following)}
        style={({ pressed }) => [styles.btn, following && styles.btnOutline, pressed && { opacity: 0.7 }]}
      >
        <Text style={[styles.btnText, following && styles.btnTextOutline]}>{following ? 'Following' : 'Follow'}</Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}`,
      playground: {
        device: 'android',
        rn: `import { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [following, setFollowing] = useState(false);
  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://picsum.photos/id/64/300' }} style={styles.avatar} />
      <Text style={styles.name}>Aarav Mehta</Text>
      <Text style={styles.role}>Frontend Developer · Pune</Text>
      <View style={styles.stats}>
        <Stat value="128" label="Posts" />
        <Stat value={following ? '2,501' : '2,500'} label="Followers" />
        <Stat value="310" label="Following" />
      </View>
      <Pressable
        onPress={() => setFollowing(!following)}
        style={({ pressed }) => [styles.btn, following && styles.btnOutline, pressed && { opacity: 0.7 }]}
      >
        <Text style={[styles.btnText, following && styles.btnTextOutline]}>{following ? 'Following ✓' : 'Follow'}</Text>
      </Pressable>
      <Text style={styles.bio}>Building apps with React and React Native. Chai lover ☕</Text>
      <StatusBar style="auto" />
    </View>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 20, backgroundColor: '#f8fafc' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#6366f1' },
  name: { fontSize: 24, fontWeight: '700', marginTop: 12, color: '#0f172a' },
  role: { color: '#64748b', marginTop: 4 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', alignSelf: 'stretch', marginVertical: 20, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#64748b', fontSize: 12 },
  btn: { backgroundColor: '#6366f1', paddingVertical: 12, borderRadius: 10, alignSelf: 'stretch', alignItems: 'center' },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#6366f1' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnTextOutline: { color: '#6366f1' },
  bio: { marginTop: 16, color: '#334155', textAlign: 'center' },
});`,
      },
      result: 'A phone screen with a round photo, name, role, a white stats card and a Follow button. Tapping it changes to an outlined "Following ✓" button and the follower count goes up by one.',
      explanation:
        "Image needs explicit width/height because a remote image size is unknown before it downloads. The stats row overrides the default column direction with flexDirection: 'row'. Pressable accepts a style function that receives { pressed }, so you get press feedback without extra state. The style array [styles.btn, following && styles.btnOutline] applies the outline style only when following is true; React Native ignores false entries. The Stat component shows that components and props work exactly like React on the web.",
    },
    {
      title: 'Flexbox layouts: header, content and bottom bar',
      scenario: 'A food-delivery style screen: fixed header, a row of category chips, a grid of two cards per row, and a bottom bar pinned to the bottom. Learn flex: 1, flexDirection, justifyContent, alignItems, flexWrap and gap.',
      steps: [
        'Make the root View flex: 1 so it fills the screen (column direction by default)',
        'Header and bottom bar have fixed heights; the middle ScrollView gets flex: 1 to take the remaining space',
        'Chips use flexDirection: "row" and gap',
        'Cards use flexDirection: "row", flexWrap: "wrap" and width: "48%" for two columns',
        'Tap a chip to change the selected category (style array)',
        'Click Run and compare with the CSS Flexbox you learned on the web',
      ],
      code: `<View style={{ flex: 1 }}>                       {/* column by default */}
  <View style={styles.header}>...</View>          {/* fixed height */}
  <ScrollView style={{ flex: 1 }}>                {/* takes remaining space */}
    <View style={{ flexDirection: 'row', gap: 8 }}>chips</View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <View style={{ width: '48%' }}>card</View>
    </View>
  </ScrollView>
  <View style={styles.bottomBar}>...</View>       {/* fixed height, always at bottom */}
</View>`,
      playground: {
        device: 'ios',
        rn: `import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';

const CATS = ['All', 'Biryani', 'Pizza', 'Dosa', 'Thali'];
const ITEMS = [
  { id: 1, name: 'Hyderabadi Biryani', price: 249, cat: 'Biryani', emoji: '🍛' },
  { id: 2, name: 'Margherita Pizza', price: 199, cat: 'Pizza', emoji: '🍕' },
  { id: 3, name: 'Masala Dosa', price: 99, cat: 'Dosa', emoji: '🥞' },
  { id: 4, name: 'Gujarati Thali', price: 299, cat: 'Thali', emoji: '🍱' },
  { id: 5, name: 'Paneer Pizza', price: 259, cat: 'Pizza', emoji: '🍕' },
  { id: 6, name: 'Mysore Dosa', price: 119, cat: 'Dosa', emoji: '🥞' },
];

export default function App() {
  const [cat, setCat] = useState('All');
  const list = cat === 'All' ? ITEMS : ITEMS.filter((i) => i.cat === cat);
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.logo}>🍽 FoodGo</Text>
        <Text style={styles.loc}>📍 Koramangala, Bengaluru</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CATS.map((c) => (
            <Pressable key={c} onPress={() => setCat(c)} style={[styles.chip, cat === c && styles.chipActive]}>
              <Text style={[styles.chipText, cat === c && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.grid}>
          {list.map((i) => (
            <View key={i.id} style={styles.card}>
              <Text style={styles.emoji}>{i.emoji}</Text>
              <Text style={styles.name}>{i.name}</Text>
              <Text style={styles.price}>₹{i.price}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {['🏠 Home', '🔍 Search', '🛒 Cart', '👤 Me'].map((t) => (
          <Text key={t} style={styles.tab}>{t}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff7ed' },
  header: { height: 70, backgroundColor: '#ea580c', justifyContent: 'center', paddingHorizontal: 16 },
  logo: { color: '#fff', fontSize: 20, fontWeight: '800' },
  loc: { color: '#ffedd5', fontSize: 12, marginTop: 2 },
  chips: { gap: 8, paddingBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#fed7aa' },
  chipActive: { backgroundColor: '#ea580c', borderColor: '#ea580c' },
  chipText: { color: '#9a3412' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 12, alignItems: 'center' },
  emoji: { fontSize: 44 },
  name: { fontWeight: '600', textAlign: 'center', marginTop: 6 },
  price: { color: '#16a34a', fontWeight: '700', marginTop: 4 },
  bottomBar: { height: 56, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#fed7aa' },
  tab: { fontSize: 12, color: '#7c2d12' },
});`,
      },
      result: 'An orange header, a horizontally scrollable row of chips, a two-column grid of food cards and a bottom bar that always stays at the bottom. Tapping "Pizza" shows only pizza cards and highlights the chip.',
      explanation:
        "The root is a column, so header, ScrollView and bottom bar stack vertically. Because only the ScrollView has flex: 1, it stretches to fill whatever height is left, which pins the bottom bar to the bottom on every phone size. The horizontal ScrollView needs its gap/padding on contentContainerStyle (the inner content), not style (the outer frame); this is one of the most common RN layout mistakes. width: '48%' plus flexWrap and space-between gives a responsive two-column grid without any media queries.",
    },
    {
      title: 'Login form: TextInput, validation and a loading button',
      scenario: 'A login screen for an ed-tech app: email and password inputs, show/hide password, inline errors and a disabled button with an ActivityIndicator while "logging in".',
      steps: [
        'Keep email, password, showPassword, errors and loading in useState',
        'Use onChangeText (it gives the string directly, not an event)',
        'Set keyboardType="email-address", autoCapitalize="none" and secureTextEntry on the right inputs',
        'Validate on submit and show red error Text below each input',
        'Disable the Pressable and show an ActivityIndicator while loading',
        'In a real app wrap the form in KeyboardAvoidingView (see code)',
      ],
      code: `import { useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, Pressable, Text, ActivityIndicator } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    const e = {};
    if (!/^\\S+@\\S+\\.\\S+$/.test(email)) e.email = 'Enter a valid email';
    if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await api.login(email, password);          // your API service
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Email" />
      {errors.email && <Text style={{ color: 'red' }}>{errors.email}</Text>}
      <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />
      <Pressable onPress={onLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text>Login</Text>}
      </Pressable>
    </KeyboardAvoidingView>
  );
}`,
      playground: {
        device: 'android',
        rn: `import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  function onLogin() {
    const e = {};
    if (!/^\\S+@\\S+\\.\\S+$/.test(email)) e.email = 'Enter a valid email';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => {               // fake API call
      setLoading(false);
      setUser(email.split('@')[0]);
    }, 1200);
  }

  if (user) {
    return (
      <View style={[styles.container, { alignItems: 'center' }]}>
        <Text style={styles.title}>Welcome, {user}! 🎉</Text>
        <Pressable style={styles.btn} onPress={() => { setUser(null); setPassword(''); }}>
          <Text style={styles.btnText}>Logout</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 LearnKaro</Text>
      <Text style={styles.sub}>Login to continue your course</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        value={email}
        onChangeText={setEmail}
        placeholder="sneha@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {!!errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <Text style={styles.label}>Password</Text>
      <View style={styles.passRow}>
        <TextInput
          style={[styles.input, { flex: 1 }, errors.password && styles.inputError]}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••"
          secureTextEntry={!show}
          onSubmitEditing={onLogin}
        />
        <Pressable onPress={() => setShow(!show)} style={styles.eye}>
          <Text>{show ? '🙈' : '👁'}</Text>
        </Pressable>
      </View>
      {!!errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <Pressable style={[styles.btn, loading && { opacity: 0.6 }]} onPress={onLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f766e', textAlign: 'center' },
  sub: { textAlign: 'center', color: '#64748b', marginBottom: 24 },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, height: 46, paddingHorizontal: 12, backgroundColor: '#f8fafc' },
  inputError: { borderColor: '#dc2626' },
  error: { color: '#dc2626', marginTop: 4, fontSize: 12 },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eye: { padding: 10 },
  btn: { marginTop: 24, backgroundColor: '#0f766e', height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});`,
      },
      result: 'Pressing Login with empty fields shows red borders and error messages. With a valid email and a 6+ character password the button shows a spinner for about a second, then a "Welcome, <name>!" screen with a Logout button.',
      explanation:
        "onChangeText={setEmail} works directly because RN passes the new string (on the web you needed e.target.value). secureTextEntry hides the password; toggling it with state gives show/hide. `!!errors.email && ...` converts the string to a boolean so nothing unexpected is rendered. The button is disabled while loading to prevent double submits, a real-world must for payment and login buttons. In a real app you would call your API service (Axios) instead of setTimeout and store the token in expo-secure-store.",
    },
    {
      title: 'FlatList: searchable contacts with pull to refresh and empty state',
      scenario: 'A contacts screen with 12 Indian names: live search, a separator, a header count, an empty message, tap to select and pull-to-refresh.',
      steps: [
        'Keep the contacts array and the search query in state',
        'Derive the filtered list (do not store it in state)',
        'Pass data, keyExtractor (string keys) and renderItem to FlatList',
        'Add ItemSeparatorComponent, ListHeaderComponent and ListEmptyComponent',
        'Add refreshing + onRefresh for pull to refresh (on the phone, drag the list down)',
        'Tap a row to mark it as selected',
      ],
      code: `<FlatList
  data={filtered}
  keyExtractor={(item) => String(item.id)}
  renderItem={({ item }) => <ContactRow contact={item} onPress={() => setSelected(item.id)} />}
  ItemSeparatorComponent={() => <View style={styles.sep} />}
  ListHeaderComponent={<Text>{filtered.length} contacts</Text>}
  ListEmptyComponent={<Text>No contacts found</Text>}
  refreshing={refreshing}
  onRefresh={onRefresh}
  onEndReached={loadMore}            // infinite scroll
  onEndReachedThreshold={0.5}
/>`,
      playground: {
        device: 'android',
        rn: `import { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';

const START = ['Aarav Shah', 'Diya Patel', 'Ishaan Reddy', 'Kavya Nair', 'Rohan Gupta', 'Ananya Iyer',
  'Vihaan Joshi', 'Saanvi Kulkarni', 'Arjun Singh', 'Meera Pillai', 'Kabir Khan', 'Riya Das']
  .map((name, i) => ({ id: i + 1, name, phone: '+91 98' + String(10000000 + i * 7311).slice(0, 8) }));

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9'];

export default function App() {
  const [contacts, setContacts] = useState(START);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setContacts((list) => [{ id: Date.now(), name: 'New Contact ' + (list.length + 1), phone: '+91 90000 00000' }, ...list]);
      setRefreshing(false);
    }, 1000);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Contacts</Text>
      <TextInput style={styles.search} value={query} onChangeText={setQuery} placeholder="🔍 Search name" />
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={<Text style={styles.count}>{filtered.length} contacts</Text>}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={<Text style={styles.empty}>No contacts match "{query}"</Text>}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => setSelected(item.id)} style={[styles.row, selected === item.id && styles.rowActive]}>
            <View style={[styles.avatar, { backgroundColor: COLORS[index % COLORS.length] }]}>
              <Text style={styles.initials}>{item.name.split(' ').map((w) => w[0]).join('')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
            </View>
            {selected === item.id && <Text>✅</Text>}
          </Pressable>
        )}
      />
      <Pressable style={styles.refresh} onPress={onRefresh}>
        <Text style={styles.refreshText}>{refreshing ? 'Refreshing…' : '↻ Simulate pull to refresh'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 12 },
  h1: { fontSize: 26, fontWeight: '800', paddingHorizontal: 16 },
  search: { margin: 16, marginBottom: 8, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9', paddingHorizontal: 16 },
  count: { paddingHorizontal: 16, color: '#64748b', marginBottom: 4 },
  sep: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 72 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  rowActive: { backgroundColor: '#eef2ff' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '600' },
  phone: { color: '#64748b', fontSize: 13 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
  refresh: { padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  refreshText: { color: '#6366f1', fontWeight: '600' },
});`,
      },
      result: 'A list of 12 contacts with coloured initials. Typing "ri" filters to Riya and others containing "ri"; typing "xyz" shows the empty message. Tapping a row highlights it with a tick. The refresh button (or pulling down on a phone) adds a "New Contact" at the top after one second.',
      explanation:
        "FlatList receives renderItem({ item, index }), not the item directly. keyExtractor returns a string because RN keys must be strings. The filtered list is derived on every render instead of being stored in state, so it can never get out of sync with contacts and query. ListEmptyComponent, ListHeaderComponent and ItemSeparatorComponent are built-in slots, so you do not need conditional rendering around the list. refreshing/onRefresh gives the native pull-to-refresh gesture on Android and iOS.",
    },
    {
      title: 'Navigation: stack + tabs (real React Navigation code, simulated in the playground)',
      scenario: 'A mini shop with a Home tab (product list → product details) and a Profile tab. In Expo you use React Navigation; the playground simulates the same behaviour with a tiny useState-based stack.',
      steps: [
        'npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context',
        'Create a HomeStack (ProductList, ProductDetails) with createNativeStackNavigator',
        'Create Tabs (Home = HomeStack, Profile) with createBottomTabNavigator and wrap them in NavigationContainer',
        'Navigate with navigation.navigate("ProductDetails", { product }) and read route.params',
        'Use navigation.goBack() or the header back button to return',
        'In the playground: tap a product, use ← Back, and switch tabs',
      ],
      code: `// App.js (Expo project)
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, FlatList, Pressable } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const PRODUCTS = [
  { id: '1', name: 'Kurta Set', price: 1299 },
  { id: '2', name: 'Running Shoes', price: 2499 },
];

function ProductList({ navigation }) {
  return (
    <FlatList
      data={PRODUCTS}
      keyExtractor={(p) => p.id}
      renderItem={({ item }) => (
        <Pressable onPress={() => navigation.navigate('ProductDetails', { product: item })}>
          <Text>{item.name} - ₹{item.price}</Text>
        </Pressable>
      )}
    />
  );
}

function ProductDetails({ route, navigation }) {
  const { product } = route.params;
  return (
    <View>
      <Text>{product.name}</Text>
      <Pressable onPress={() => navigation.goBack()}><Text>Back</Text></Pressable>
    </View>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductList" component={ProductList} options={{ title: 'Shop' }} />
      <Stack.Screen name="ProductDetails" component={ProductDetails}
        options={({ route }) => ({ title: route.params.product.name })} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={route.name === 'Home' ? 'home' : 'person'} color={color} size={size} />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}`,
      playground: {
        device: 'ios',
        rn: `import { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';

// Playground stand-in for React Navigation: a stack of { name, params } per tab
const PRODUCTS = [
  { id: '1', name: 'Cotton Kurta Set', price: 1299, emoji: '👘', desc: 'Pure cotton, hand block printed in Jaipur.' },
  { id: '2', name: 'Running Shoes', price: 2499, emoji: '👟', desc: 'Lightweight shoes with cushioned sole.' },
  { id: '3', name: 'Steel Water Bottle', price: 499, emoji: '🍶', desc: '1 litre, keeps water cold for 24 hours.' },
];

export default function App() {
  const [tab, setTab] = useState('Home');
  const [stack, setStack] = useState([{ name: 'ProductList' }]);
  const navigation = {
    navigate: (name, params) => setStack((s) => [...s, { name, params }]),
    goBack: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
  };
  const route = stack[stack.length - 1];

  let title = 'Profile';
  let screen = <ProfileScreen />;
  if (tab === 'Home') {
    title = route.name === 'ProductList' ? 'Shop' : route.params.product.name;
    screen = route.name === 'ProductList'
      ? <ProductList navigation={navigation} />
      : <ProductDetails route={route} navigation={navigation} />;
  }

  return (
    <View style={styles.app}>
      <View style={styles.header}>
        {tab === 'Home' && stack.length > 1 ? (
          <Pressable onPress={navigation.goBack} style={styles.back}><Text style={styles.backText}>‹ Back</Text></Pressable>
        ) : <View style={styles.back} />}
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.back} />
      </View>
      <View style={{ flex: 1 }}>{screen}</View>
      <View style={styles.tabBar}>
        {[['Home', '🏠'], ['Profile', '👤']].map(([name, icon]) => (
          <Pressable key={name} style={styles.tabBtn} onPress={() => setTab(name)}>
            <Text style={{ fontSize: 20, opacity: tab === name ? 1 : 0.5 }}>{icon}</Text>
            <Text style={[styles.tabLabel, tab === name && { color: '#2563eb' }]}>{name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ProductList({ navigation }) {
  return (
    <FlatList
      data={PRODUCTS}
      keyExtractor={(p) => p.id}
      contentContainerStyle={{ padding: 12 }}
      renderItem={({ item }) => (
        <Pressable style={styles.item} onPress={() => navigation.navigate('ProductDetails', { product: item })}>
          <Text style={{ fontSize: 30 }}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>₹{item.price.toLocaleString('en-IN')}</Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </Pressable>
      )}
    />
  );
}

function ProductDetails({ route, navigation }) {
  const { product } = route.params;
  return (
    <View style={styles.details}>
      <Text style={{ fontSize: 90, textAlign: 'center' }}>{product.emoji}</Text>
      <Text style={styles.dName}>{product.name}</Text>
      <Text style={styles.dPrice}>₹{product.price.toLocaleString('en-IN')}</Text>
      <Text style={styles.desc}>{product.desc}</Text>
      <Pressable style={styles.btn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>Go back</Text>
      </Pressable>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.details}>
      <Text style={{ fontSize: 60, textAlign: 'center' }}>👩‍💻</Text>
      <Text style={styles.dName}>Neha Verma</Text>
      <Text style={styles.desc}>Member since 2024 · Ahmedabad</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#f8fafc' },
  header: { height: 50, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  back: { width: 70, paddingLeft: 10 },
  backText: { color: '#2563eb', fontSize: 16 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '600' },
  price: { color: '#16a34a', fontWeight: '700', marginTop: 2 },
  chev: { fontSize: 24, color: '#94a3b8' },
  details: { flex: 1, padding: 24 },
  dName: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  dPrice: { fontSize: 20, color: '#16a34a', fontWeight: '700', textAlign: 'center', marginTop: 4 },
  desc: { color: '#475569', textAlign: 'center', marginTop: 12 },
  btn: { marginTop: 24, backgroundColor: '#2563eb', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  tabBar: { height: 60, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
});`,
      },
      result: 'A header, a product list and a bottom tab bar. Tapping a product pushes a details screen with the product name in the header and a "‹ Back" button. The Profile tab shows a profile; switching back to Home keeps the stack where you left it.',
      explanation:
        "React Navigation keeps a stack of routes per navigator: navigate pushes { name, params }, goBack pops. The playground recreates exactly that with an array in state, and passes the same navigation and route props to the screens, so ProductList and ProductDetails are written exactly as they would be with React Navigation. Notice that each tab keeps its own state (the Home stack survives a tab switch), which is how real nested tab + stack navigators behave. Pass small, serialisable params (an id is even better than the whole product) because params are part of navigation state and deep links.",
    },
  ],
  interview: [
    { q: 'What is React Native and how is it different from React (web)?', a: "React Native is a framework for building native Android and iOS apps with React. The React part (components, props, state, hooks, context) is the same; the renderer is different. React DOM renders HTML elements in a browser; React Native renders native platform views (View becomes android.view.View / UIView). There is no DOM, no CSS files and no HTML tags: you use View, Text, Image, Pressable and style objects with Flexbox.", level: 'Easy' },
    { q: 'Is React Native a WebView/hybrid app like Ionic or Cordova?', a: "No. Hybrid apps render HTML/CSS inside a WebView. React Native runs your JavaScript in a JS engine (Hermes by default) and creates real native UI components, so scrolling, text input and gestures are native.", level: 'Easy' },
    { q: 'What is Expo and when would you not use Expo Go?', a: "Expo is a framework and platform around React Native: create-expo-app, a large SDK of native modules (camera, location, notifications, secure store), Expo Router, and EAS cloud builds/updates. Expo Go is a prebuilt app for quick development; it only contains Expo SDK modules. If you need a custom native module (e.g. a payment SDK with native code) you create a development build with expo-dev-client, which is still Expo, just with your own native code included.", level: 'Medium' },
    { q: 'What is the New Architecture in React Native?', a: "Enabled by default since RN 0.76: JSI (JavaScript Interface) lets JS hold references to C++ objects and call native code synchronously instead of sending JSON messages over the old asynchronous bridge; Fabric is the new renderer (supports concurrent React features); TurboModules load native modules lazily. Result: faster startup and smoother UI.", level: 'Hard' },
    { q: 'Why must text be inside a <Text> component?', a: "Native platforms have specific text components (TextView / UILabel). A View is only a layout container and cannot draw strings, so React Native throws 'Text strings must be rendered within a <Text> component' if a raw string or number is placed directly inside a View.", level: 'Easy' },
    { q: 'How is Flexbox in React Native different from CSS Flexbox?', a: "flexDirection defaults to 'column' (web: row), alignContent defaults to flex-start, flexShrink defaults to 0, and flex accepts only a single number. Every View is a flex container by default, there is no display: block/grid, and sizes are unitless density-independent pixels.", level: 'Medium' },
    { q: 'FlatList vs ScrollView: when do you use which?', a: "ScrollView renders all children immediately, fine for short content like a form or profile. FlatList virtualises: it renders only the visible rows plus a buffer and unmounts off-screen rows, so it is required for long or unknown-length lists (products, chats, feeds). FlatList also gives pull-to-refresh, onEndReached for infinite scroll, headers, separators and empty components.", level: 'Easy' },
    { q: 'How do you improve FlatList performance?', a: "Provide a stable keyExtractor, memoise the row component (React.memo) and renderItem (useCallback), avoid inline heavy work, use getItemLayout when rows have a fixed height, tune initialNumToRender/windowSize/maxToRenderPerBatch, use optimised image components (expo-image), and consider Shopify's FlashList for very large lists.", level: 'Hard' },
    { q: 'How does navigation work in a React Native app?', a: "With React Navigation: a NavigationContainer holds the state, navigators (native stack, bottom tabs, drawer) define screens, and screens receive navigation and route props. navigation.navigate('Screen', params) pushes or goes to a screen, route.params reads params, goBack pops. Expo Router builds on React Navigation and maps files in the app folder to routes with deep linking built in.", level: 'Medium' },
    { q: 'How do you write platform-specific code?', a: "Use Platform.OS ('ios' | 'android' | 'web') for small differences, Platform.select({ ios: ..., android: ... }) for values, or platform-specific files like Button.ios.js and Button.android.js, which the bundler picks automatically.", level: 'Medium' },
    { q: 'How do you store data locally in React Native? Is localStorage available?', a: "There is no localStorage. Use @react-native-async-storage/async-storage for small non-sensitive key-value data (async API: await AsyncStorage.setItem(key, JSON.stringify(value))), expo-secure-store for tokens and secrets (Keychain/Keystore), and SQLite (expo-sqlite) or MMKV for larger or faster storage.", level: 'Medium' },
    { q: 'How do you release a React Native (Expo) app to the Play Store?', a: "Configure app.json (name, android.package, version, icon, splash), run eas build -p android --profile production to get a signed .aab, then upload it with eas submit or the Play Console (internal testing first). For JS-only fixes you can ship over-the-air updates with EAS Update without a new store release.", level: 'Hard' },
  ],
  practice: [
    {
      task: 'Build a "Business card" screen: a logo circle with initials, name, job title, three rows (📞 phone, ✉ email, 📍 city) and two buttons side by side (Call, Save contact) that each change a status Text when pressed.',
      hint: 'Root View with flex: 1 and alignItems: "center". The two buttons go in a View with flexDirection: "row" and gap; give each button flex: 1.',
      solution: `import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function App() {
  const [status, setStatus] = useState('');
  return (
    <View style={styles.container}>
      <View style={styles.logo}><Text style={styles.initials}>RK</Text></View>
      <Text style={styles.name}>Rahul Kapoor</Text>
      <Text style={styles.job}>React Native Developer</Text>
      <View style={styles.info}>
        <Text style={styles.row}>📞 +91 98765 43210</Text>
        <Text style={styles.row}>✉ rahul@example.com</Text>
        <Text style={styles.row}>📍 Chennai</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.btn} onPress={() => setStatus('Calling Rahul…')}><Text style={styles.btnText}>Call</Text></Pressable>
        <Pressable style={[styles.btn, styles.secondary]} onPress={() => setStatus('Contact saved ✅')}><Text style={styles.btnText}>Save contact</Text></Pressable>
      </View>
      {!!status && <Text style={styles.status}>{status}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f1f5f9' },
  logo: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#0ea5e9', alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontSize: 32, fontWeight: '800' },
  name: { fontSize: 24, fontWeight: '700', marginTop: 12 },
  job: { color: '#64748b' },
  info: { alignSelf: 'stretch', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginVertical: 20, gap: 10 },
  row: { fontSize: 16 },
  actions: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  btn: { flex: 1, backgroundColor: '#0ea5e9', padding: 14, borderRadius: 10, alignItems: 'center' },
  secondary: { backgroundColor: '#22c55e' },
  btnText: { color: '#fff', fontWeight: '700' },
  status: { marginTop: 16, color: '#334155' },
});`,
    },
    {
      task: 'Create a "Expense tracker" with two TextInputs (title, amount with keyboardType="numeric"), an Add button, a FlatList of expenses with a delete button on each row, and a total at the top in ₹. Ignore empty titles and non-positive amounts.',
      hint: 'Convert the amount with Number(amount). Total = expenses.reduce((s, e) => s + e.amount, 0). Use Date.now() as the id and String(id) in keyExtractor.',
      solution: `import { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';

export default function App() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [expenses, setExpenses] = useState([]);
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  function add() {
    const value = Number(amount);
    if (!title.trim() || !(value > 0)) return;
    setExpenses([{ id: Date.now(), title: title.trim(), amount: value }, ...expenses]);
    setTitle(''); setAmount('');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.total}>Total: ₹{total.toLocaleString('en-IN')}</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title (e.g. Groceries)" />
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="Amount" keyboardType="numeric" />
      <Pressable style={styles.btn} onPress={add}><Text style={styles.btnText}>Add expense</Text></Pressable>
      <FlatList
        data={expenses}
        keyExtractor={(e) => String(e.id)}
        ListEmptyComponent={<Text style={styles.empty}>No expenses yet</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{ flex: 1 }}>{item.title}</Text>
            <Text style={styles.amount}>₹{item.amount}</Text>
            <Pressable onPress={() => setExpenses(expenses.filter((e) => e.id !== item.id))}><Text>🗑</Text></Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  total: { fontSize: 26, fontWeight: '800', color: '#b91c1c', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, height: 44, paddingHorizontal: 12, marginBottom: 8 },
  btn: { backgroundColor: '#b91c1c', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  amount: { fontWeight: '700' },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 30 },
});`,
    },
    {
      task: 'Build a photo gallery with a FlatList of 20 images from picsum.photos in 3 columns (numColumns={3}). Tapping a photo opens it full screen inside a Modal with a Close button.',
      hint: 'Image URI: "https://picsum.photos/id/" + (i + 10) + "/300". Use useWindowDimensions() to make each tile width / 3. Modal props: visible, transparent, animationType="fade", onRequestClose.',
      solution: `import { useState } from 'react';
import { View, Text, Image, FlatList, Pressable, Modal, useWindowDimensions, StyleSheet } from 'react-native';

const PHOTOS = Array.from({ length: 20 }, (_, i) => ({ id: String(i + 10), uri: 'https://picsum.photos/id/' + (i + 10) + '/300' }));

export default function App() {
  const { width } = useWindowDimensions();
  const size = width / 3;
  const [open, setOpen] = useState(null);
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <FlatList
        data={PHOTOS}
        numColumns={3}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => setOpen(item)}>
            <Image source={{ uri: item.uri }} style={{ width: size, height: size, borderWidth: 1, borderColor: '#000' }} />
          </Pressable>
        )}
      />
      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <View style={styles.backdrop}>
          {open && <Image source={{ uri: open.uri.replace('/300', '/600') }} style={{ width: width - 32, height: width - 32 }} />}
          <Pressable style={styles.close} onPress={() => setOpen(null)}><Text style={styles.closeText}>Close ✕</Text></Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center' },
  close: { marginTop: 20, backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  closeText: { fontWeight: '700' },
});`,
    },
    {
      task: 'Settings screen: rows with a label and a Switch for "Dark mode", "Notifications" and "Save data". When Dark mode is on, the whole screen switches to a dark background and light text.',
      hint: 'Keep one settings object in state and update with setSettings(s => ({ ...s, [key]: value })). Build the theme colours from settings.dark.',
      solution: `import { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

const ROWS = [
  { key: 'dark', label: '🌙 Dark mode' },
  { key: 'notifications', label: '🔔 Notifications' },
  { key: 'saveData', label: '📶 Save data' },
];

export default function App() {
  const [settings, setSettings] = useState({ dark: false, notifications: true, saveData: false });
  const theme = settings.dark
    ? { bg: '#0f172a', card: '#1e293b', text: '#f8fafc' }
    : { bg: '#f1f5f9', card: '#ffffff', text: '#0f172a' };
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.h1, { color: theme.text }]}>Settings</Text>
      {ROWS.map((r) => (
        <View key={r.key} style={[styles.row, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.text }]}>{r.label}</Text>
          <Switch value={settings[r.key]} onValueChange={(v) => setSettings((s) => ({ ...s, [r.key]: v }))} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  h1: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 10 },
  label: { fontSize: 16 },
});`,
    },
    {
      task: 'Real Expo project: create a 3-screen app with React Navigation: a bottom tab navigator (Home, Settings) where Home is a native stack (NotesList → NoteDetails). Pass the note id as a param and set the header title to the note title.',
      hint: 'Install with npx expo install. Put the Stack inside the Home tab and set headerShown: false on the tab navigator so you do not get two headers. Use options={({ route }) => ({ title: ... })}.',
      solution: `// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, FlatList, Pressable } from 'react-native';

const NOTES = [
  { id: '1', title: 'Shopping list', body: 'Milk, atta, dal, tomatoes' },
  { id: '2', title: 'Interview prep', body: 'Revise hooks, FlatList, navigation' },
];

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function NotesList({ navigation }) {
  return (
    <FlatList
      data={NOTES}
      keyExtractor={(n) => n.id}
      renderItem={({ item }) => (
        <Pressable style={{ padding: 16 }} onPress={() => navigation.navigate('NoteDetails', { id: item.id })}>
          <Text style={{ fontSize: 16 }}>{item.title}</Text>
        </Pressable>
      )}
    />
  );
}

function NoteDetails({ route }) {
  const note = NOTES.find((n) => n.id === route.params.id);
  return <View style={{ padding: 16 }}><Text>{note.body}</Text></View>;
}

function Settings() {
  return <View style={{ padding: 16 }}><Text>Settings</Text></View>;
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="NotesList" component={NotesList} options={{ title: 'My Notes' }} />
      <Stack.Screen
        name="NoteDetails"
        component={NoteDetails}
        options={({ route }) => ({ title: NOTES.find((n) => n.id === route.params.id).title })}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Settings" component={Settings} options={{ headerShown: true }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'What is the default flexDirection of a View in React Native?',
      options: ['row', 'column', 'row-reverse', 'There is no default'],
      answer: 1,
      explanation: 'React Native uses column by default, unlike CSS on the web where the default is row.',
    },
    {
      question: 'Which code renders the text correctly?',
      options: ['<View>Hello</View>', '<View>{"Hello"}</View>', '<View><Text>Hello</Text></View>', '<Text><View>Hello</View></Text>'],
      answer: 2,
      explanation: 'Every string must be inside a <Text> component. Strings directly inside a View throw an error.',
    },
    {
      question: 'Which prop of TextInput gives you the new string directly?',
      options: ['onChange', 'onInput', 'onPress', 'onChangeText'],
      answer: 3,
      explanation: 'onChangeText receives the text value; onChange receives a native event object.',
    },
    {
      question: 'Why use FlatList instead of ScrollView + map for 1,000 products?',
      options: ['FlatList virtualises rows, rendering only what is visible', 'ScrollView cannot scroll vertically', 'FlatList does not need keys', 'ScrollView only works on iOS'],
      answer: 0,
      explanation: 'ScrollView renders every child up front; FlatList renders visible rows and recycles memory.',
    },
    {
      question: 'How do you read params passed with navigation.navigate("Details", { id: 7 }) in React Navigation?',
      options: ['props.params.id', 'useParams().id', 'route.params.id', 'window.location.id'],
      answer: 2,
      explanation: 'Each screen receives a route prop; route.params holds the params (or use the useRoute() hook). useParams is React Router (web).',
    },
  ],
};
