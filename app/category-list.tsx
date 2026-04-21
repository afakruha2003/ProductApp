import { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, RefreshControl,
  Modal, TextInput, Alert,
} from 'react-native';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useFocusEffect } from 'expo-router';
import Toast from '../components/Toast';

type Category = { id: string; name: string };

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit modal
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2400);
  };

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      const list: Category[] = snapshot.docs.map(d => ({
        id: d.id,
        name: d.data().name,
      }));
      setCategories(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchCategories(); }, []));

  const openEdit = (item: Category) => {
    setEditItem(item);
    setEditName(item.name);
    setEditVisible(true);
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !editItem) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'categories', editItem.id), { name: editName.trim() });
      setCategories(prev => prev.map(c => c.id === editItem.id ? { ...c, name: editName.trim() } : c));
      setEditVisible(false);
      showToast('Category updated!');
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

const handleDelete = async (item: Category) => {
  try {
    await deleteDoc(doc(db, 'categories', item.id));
    setCategories(prev => prev.filter(c => c.id !== item.id));
    showToast('Category deleted!');
  } catch (e: any) {
    showToast(e.message, 'error');
  }
};

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} tintColor="#e94560"
            onRefresh={() => { setRefreshing(true); fetchCategories(); }} />
        }
        ListHeaderComponent={
          <Text style={styles.countText}>{categories.length} categories</Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>No categories yet</Text>
            <Text style={styles.emptySubtext}>Go back and add your first category</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <Text style={styles.icon}>📂</Text>
            </View>
            <Text style={styles.cardText}>{item.name}</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
              <Text style={styles.editBtnText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Edit Modal */}
      <Modal visible={editVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit Category</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              autoFocus
              placeholderTextColor="#aaa"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setEditVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn, saving && styles.disabled]}
                onPress={handleUpdate}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>Save</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  list: { padding: 16, gap: 10 },
  countText: { fontSize: 13, color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  iconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#fff3f5', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  icon: { fontSize: 18 },
  cardText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  editBtn: { padding: 8, marginRight: 4 },
  editBtnText: { fontSize: 18 },
  deleteBtn: { padding: 8 },
  deleteBtnText: { fontSize: 18 },
  // Modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 24, width: '85%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 16 },
  modalInput: {
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10,
    padding: 13, fontSize: 15, color: '#1a1a2e',
    marginBottom: 20, backgroundColor: '#fafafa',
  },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f0f4f8', borderWidth: 1.5, borderColor: '#e0e0e0' },
  saveBtn: { backgroundColor: '#e94560' },
  disabled: { opacity: 0.6 },
  cancelBtnText: { color: '#555', fontWeight: '600' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  // Empty
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#888' },
});