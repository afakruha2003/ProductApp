import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useRouter } from 'expo-router';
import Toast from '../components/Toast';

type Category = { id: string; name: string };

export default function AddProduct() {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  const router = useRouter();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2400);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, 'categories'));
      const list: Category[] = snapshot.docs.map(d => ({
        id: d.id,
        name: d.data().name,
      }));
      setCategories(list);
    };
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!productName.trim() || !price.trim() || !selectedCategory) {
      showToast('Please fill in all fields and select a category', 'error');
      return;
    }
    if (isNaN(parseFloat(price))) {
      showToast('Price must be a valid number', 'error');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        name: productName.trim(),
        price: parseFloat(price),
        description: description.trim(),
        category: selectedCategory,
        createdAt: new Date(),
      });
      showToast('Product saved successfully!');
      setProductName('');
      setPrice('');
      setDescription('');
      setSelectedCategory('');
      setTimeout(() => router.back(), 1800);
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Product Info</Text>

          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Wireless Headphones"
            placeholderTextColor="#aaa"
            value={productName}
            onChangeText={setProductName}
          />

          <Text style={styles.label}>Price *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 299.99"
            placeholderTextColor="#aaa"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Optional product description..."
            placeholderTextColor="#aaa"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Category *</Text>
          {categories.length === 0 ? (
            <Text style={styles.noCategory}>No categories found. Please add a category first.</Text>
          ) : (
            <View style={styles.categoryGrid}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.name)}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.name && styles.selectedChip,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.chipText,
                    selectedCategory === cat.name && styles.selectedChipText,
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveButtonText}>SAVE PRODUCT</Text>
          }
        </TouchableOpacity>
      </ScrollView>
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  container: { padding: 16, gap: 14 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 16 },
  label: {
    fontSize: 12, fontWeight: '700', color: '#888',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  input: {
    borderWidth: 1.5, borderColor: '#e8e8e8', borderRadius: 10,
    padding: 13, fontSize: 15, color: '#1a1a2e',
    marginBottom: 14, backgroundColor: '#fafafa',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#fafafa',
  },
  selectedChip: { backgroundColor: '#1a1a2e', borderColor: '#1a1a2e' },
  chipText: { fontSize: 14, color: '#555', fontWeight: '500' },
  selectedChipText: { color: '#e94560', fontWeight: '700' },
  noCategory: { color: '#aaa', fontSize: 14, fontStyle: 'italic' },
  saveButton: {
    backgroundColor: '#e94560', borderRadius: 12,
    padding: 18, alignItems: 'center', marginBottom: 20,
  },
  disabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});