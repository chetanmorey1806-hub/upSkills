// Starter templates for the React Native mode of the Code Playground (Expo-style App.js).
export const RN_TEMPLATES = {
  'Hello React Native': {
    rn: `import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, React Native! 👋</Text>
      <Text style={styles.sub}>Edit App.js and the phone updates.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f9ff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  sub: { marginTop: 8, color: '#475569' },
});`,
  },
  'Counter (useState + Pressable)': {
    rn: `import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <View style={styles.container}>
      <Text style={styles.count}>{count}</Text>
      <View style={styles.row}>
        <Pressable style={[styles.btn, styles.minus]} onPress={() => setCount(count - 1)}>
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={() => setCount(count + 1)}>
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => setCount(0)}><Text style={styles.reset}>Reset</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  count: { fontSize: 72, fontWeight: '800', color: '#4f46e5' },
  row: { flexDirection: 'row', gap: 16 },
  btn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center' },
  minus: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  reset: { color: '#64748b', textDecorationLine: 'underline' },
});`,
  },
  'Todo list (TextInput + FlatList)': {
    rn: `import { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';

export default function App() {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState([{ id: '1', title: 'Learn React Native', done: false }]);

  const add = () => {
    if (!text.trim()) return;
    setTodos([...todos, { id: String(Date.now()), title: text.trim(), done: false }]);
    setText('');
  };
  const toggle = (id) => setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id) => setTodos(todos.filter((t) => t.id !== id));

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>My Tasks ({todos.filter((t) => !t.done).length} left)</Text>
      <View style={styles.row}>
        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Add a task" onSubmitEditing={add} />
        <Pressable style={styles.add} onPress={add}><Text style={styles.addText}>Add</Text></Pressable>
      </View>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No tasks yet 🎉</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.item} onPress={() => toggle(item.id)} onLongPress={() => remove(item.id)}>
            <Text style={[styles.title, item.done && styles.done]}>{item.done ? '✅' : '⬜'}  {item.title}</Text>
            <Pressable onPress={() => remove(item.id)}><Text>🗑</Text></Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  h1: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: '#fff' },
  add: { backgroundColor: '#16a34a', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  addText: { color: '#fff', fontWeight: 'bold' },
  item: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 16 },
  done: { textDecorationLine: 'line-through', color: '#94a3b8' },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 30 },
});`,
  },
  'Weather / Temperature app (fetch API)': {
    rn: `import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

// Free API, no key needed: https://open-meteo.com
const ICON = (code) => (code === 0 ? '☀️' : code <= 3 ? '⛅' : code <= 48 ? '🌫️' : code <= 67 ? '🌧️' : code <= 77 ? '❄️' : code <= 82 ? '🌦️' : '⛈️');

export default function App() {
  const [city, setCity] = useState('Pune');
  const [data, setData] = useState(null);
  const [place, setPlace] = useState('');
  const [unit, setUnit] = useState('C');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function search(name = city) {
    setLoading(true); setError('');
    try {
      const geo = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&name=' + encodeURIComponent(name)).then((r) => r.json());
      if (!geo.results?.length) throw new Error('City not found');
      const { latitude, longitude, name: n, country } = geo.results[0];
      const w = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude +
        '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto').then((r) => r.json());
      setPlace(n + ', ' + country);
      setData(w);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { search(); }, []);
  const t = (c) => Math.round(unit === 'C' ? c : c * 9 / 5 + 32) + '°' + unit;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.row}>
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Search city" onSubmitEditing={() => search()} />
        <Pressable style={styles.btn} onPress={() => search()}><Text style={styles.btnText}>🔍</Text></Pressable>
      </View>
      {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />}
      {!!error && <Text style={styles.error}>⚠ {error}</Text>}
      {data && !loading && (
        <>
          <Text style={styles.place}>📍 {place}</Text>
          <Text style={styles.icon}>{ICON(data.current.weather_code)}</Text>
          <Text style={styles.temp}>{t(data.current.temperature_2m)}</Text>
          <Text style={styles.meta}>💧 {data.current.relative_humidity_2m}%   💨 {data.current.wind_speed_10m} km/h</Text>
          <Pressable onPress={() => setUnit(unit === 'C' ? 'F' : 'C')} style={styles.unit}><Text style={styles.btnText}>Show °{unit === 'C' ? 'F' : 'C'}</Text></Pressable>
          <Text style={styles.h2}>7-day forecast</Text>
          {data.daily.time.map((d, i) => (
            <View key={d} style={styles.day}>
              <Text style={styles.dayText}>{new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}</Text>
              <Text style={styles.dayText}>{ICON(data.daily.weather_code[i])}</Text>
              <Text style={styles.dayText}>{t(data.daily.temperature_2m_min[i])} / {t(data.daily.temperature_2m_max[i])}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e3a8a' },
  row: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, height: 44 },
  btn: { backgroundColor: '#f59e0b', borderRadius: 10, width: 48, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  error: { color: '#fecaca', marginTop: 20, textAlign: 'center' },
  place: { color: '#fff', fontSize: 18, textAlign: 'center', marginTop: 20 },
  icon: { fontSize: 72, textAlign: 'center' },
  temp: { color: '#fff', fontSize: 56, fontWeight: '800', textAlign: 'center' },
  meta: { color: '#bfdbfe', textAlign: 'center' },
  unit: { alignSelf: 'center', marginTop: 10, backgroundColor: 'rgba(255,255,255,.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  h2: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginTop: 20, marginBottom: 8 },
  day: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,.1)', padding: 12, borderRadius: 10, marginBottom: 6 },
  dayText: { color: '#fff' },
});`,
  },
  'Shop app (products + cart)': {
    rn: `import { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';

const PRODUCTS = [
  { id: 1, name: 'Wireless Earbuds', price: 1499, emoji: '🎧' },
  { id: 2, name: 'Smart Watch', price: 2999, emoji: '⌚' },
  { id: 3, name: 'Power Bank', price: 999, emoji: '🔋' },
  { id: 4, name: 'Bluetooth Speaker', price: 1999, emoji: '🔊' },
  { id: 5, name: 'Phone Stand', price: 299, emoji: '📱' },
];
const rupee = (n) => '₹' + n.toLocaleString('en-IN');

export default function App() {
  const [cart, setCart] = useState({}); // { productId: qty }
  const [screen, setScreen] = useState('shop');
  const items = useMemo(() => PRODUCTS.filter((p) => cart[p.id]).map((p) => ({ ...p, qty: cart[p.id] })), [cart]);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const change = (id, d) => setCart((c) => { const q = (c[id] || 0) + d; const n = { ...c }; if (q <= 0) delete n[id]; else n[id] = q; return n; });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🛍 ShopKart</Text>
        <Pressable onPress={() => setScreen(screen === 'shop' ? 'cart' : 'shop')}>
          <Text style={styles.cartBtn}>{screen === 'shop' ? '🛒 ' + count : '← Shop'}</Text>
        </Pressable>
      </View>
      {screen === 'shop' ? (
        <FlatList
          data={PRODUCTS}
          numColumns={2}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={{ padding: 8 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{rupee(item.price)}</Text>
              <Pressable style={styles.add} onPress={() => change(item.id, 1)}>
                <Text style={styles.addText}>{cart[item.id] ? 'Added (' + cart[item.id] + ')' : 'Add to cart'}</Text>
              </Pressable>
            </View>
          )}
        />
      ) : (
        <View style={{ flex: 1, padding: 12 }}>
          {items.length === 0 && <Text style={styles.empty}>Your cart is empty</Text>}
          {items.map((i) => (
            <View key={i.id} style={styles.line}>
              <Text style={{ flex: 1 }}>{i.emoji} {i.name}</Text>
              <Pressable onPress={() => change(i.id, -1)}><Text style={styles.qtyBtn}>−</Text></Pressable>
              <Text style={styles.qty}>{i.qty}</Text>
              <Pressable onPress={() => change(i.id, 1)}><Text style={styles.qtyBtn}>+</Text></Pressable>
              <Text style={styles.lineTotal}>{rupee(i.price * i.qty)}</Text>
            </View>
          ))}
          <View style={styles.totalBox}>
            <Text style={styles.total}>Total: {rupee(total)}</Text>
            <Pressable style={[styles.add, { opacity: items.length ? 1 : 0.4 }]} disabled={!items.length} onPress={() => { setCart({}); setScreen('shop'); }}>
              <Text style={styles.addText}>Place order</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#4f46e5' },
  logo: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cartBtn: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: { flex: 1, margin: 6, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center' },
  emoji: { fontSize: 42 },
  name: { fontWeight: '600', textAlign: 'center', marginTop: 6 },
  price: { color: '#16a34a', fontWeight: 'bold', marginVertical: 6 },
  add: { backgroundColor: '#f59e0b', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  addText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  line: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, gap: 8 },
  qtyBtn: { fontSize: 20, paddingHorizontal: 8, color: '#4f46e5' },
  qty: { minWidth: 20, textAlign: 'center' },
  lineTotal: { width: 70, textAlign: 'right', fontWeight: '600' },
  totalBox: { marginTop: 'auto', gap: 10 },
  total: { fontSize: 20, fontWeight: 'bold', textAlign: 'right' },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 40 },
});`,
  },
};
