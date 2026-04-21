import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { doc, updateDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';

type Category = { id: string; name: string };

export default function ProductDetail() {
  const params = useLocalSearchParams<{
    id: string; name: string; price: string; category: string; description: string;
  }>();

  const [productName, setProductName] = useState(params.name);
  const [price, setPrice] = useState(String(params.price));
  const [description, setDescription] = useState(params.description ?? '');
  const [selectedCategory, setSelectedCategory] = useState(params.category);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, 'categories'));
      const list: Category[] = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setCategories(list);
    };
    fetchCategories();
  }, []);

  const handleUpdate = async () => {
    if (!productName.trim() || !price.trim() || !selectedCategory) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'products', params.id), {
        name: productName.trim(),
        price: parseFloat(price),
        description: description.trim(),
        category: selectedCategory,
      });
      Alert.alert('Success', 'Product updated!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${params.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteDoc(doc(db, 'products', params.id));
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Product Info</Text>

          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            value={productName}
            onChangeText={setProductName}
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>Price *</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor="#aaa"
            placeholder="Optional description..."
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Category *</Text>
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
        </View>

        <TouchableOpacity
          style={[styles.button, styles.updateButton, loading && styles.disabled]}
          onPress={handleUpdate}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>✏️  UPDATE PRODUCT</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton, loading && styles.disabled]}
          onPress={handleDelete}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>🗑️  DELETE PRODUCT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  container: { padding: 16, gap: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 16 },
  label: {
    fontSize: 12, fontWeight: '700', color: '#888',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  input: {
    borderWidth: 1.5, borderColor: '#e8e8e8', borderRadius: 10,
    padding: 13, fontSize: 15, color: '#1a1a2e', marginBottom: 14, backgroundColor: '#fafafa',
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
  button: {
    borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 4,
  },
  updateButton: { backgroundColor: '#0f3460' },
  deleteButton: { backgroundColor: '#e94560', marginBottom: 20 },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },
});