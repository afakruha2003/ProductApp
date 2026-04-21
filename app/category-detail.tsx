import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CategoryDetail() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [categoryName, setCategoryName] = useState(name);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'categories', id), {
        name: categoryName.trim(),
      });
      Alert.alert('Success', 'Category updated!', [
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
      'Delete Category',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteDoc(doc(db, 'categories', id));
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
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Category Name</Text>
          <TextInput
            style={styles.input}
            value={categoryName}
            onChangeText={setCategoryName}
            placeholderTextColor="#aaa"
          />

          <TouchableOpacity
            style={[styles.button, styles.updateButton, loading && styles.buttonDisabled]}
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>✏️  UPDATE CATEGORY</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton, loading && styles.buttonDisabled]}
            onPress={handleDelete}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>🗑️  DELETE CATEGORY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1a1a2e',
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  button: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  updateButton: { backgroundColor: '#0f3460' },
  deleteButton: { backgroundColor: '#e94560' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});