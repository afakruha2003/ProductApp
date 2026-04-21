import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const menuItems = [
    { label: 'Add Category', icon: '➕', route: '/add-category', color: '#e94560' },
    { label: 'View Categories', icon: '📂', route: '/category-list', color: '#0f3460' },
    { label: 'Add Product', icon: '📦', route: '/add-product', color: '#e94560' },
    { label: 'View Products', icon: '🛍️', route: '/product-list', color: '#0f3460' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Product Manager</Text>
          <Text style={styles.headerSubtitle}>Manage your store with ease</Text>
        </View>

        <View style={styles.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={[styles.card, { borderLeftColor: item.color }]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={[styles.cardArrow, { color: item.color }]}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  container: { flex: 1, padding: 20 },
  header: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 14, color: '#aaa' },
  grid: { gap: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: { fontSize: 24, marginRight: 14 },
  cardLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  cardArrow: { fontSize: 20, fontWeight: 'bold' },
});