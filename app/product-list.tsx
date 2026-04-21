import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, TextInput, RefreshControl,
  Modal, ScrollView, Alert,
} from 'react-native';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useFocusEffect } from 'expo-router';
import Toast from '../components/Toast';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
};

type Category = { id: string; name: string };

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [filterTabs, setFilterTabs] = useState<string[]>(['All']);

  // Edit modal state
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [saving, setSaving] = useState(false);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2400);
  };

  const fetchData = async () => {
    try {
      const [productSnap, categorySnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'categories')),
      ]);
      const productList: Product[] = productSnap.docs.map(d => ({
        id: d.id,
        name: d.data().name,
        price: d.data().price,
        category: d.data().category,
        description: d.data().description,
      }));
      const categoryList: Category[] = categorySnap.docs.map(d => ({
        id: d.id,
        name: d.data().name,
      }));
      setProducts(productList);
      setFiltered(productList);
      setCategories(categoryList);
      const tabs = ['All', ...Array.from(new Set(productList.map(p => p.category)))];
      setFilterTabs(tabs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  useEffect(() => {
    let result = products;
    if (selectedFilter !== 'All') result = result.filter(p => p.category === selectedFilter);
    if (search.trim()) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, selectedFilter, products]);

  const openEdit = (item: Product) => {
    setEditItem(item);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditDesc(item.description ?? '');
    setEditCategory(item.category);
    setEditVisible(true);
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !editPrice.trim() || !editCategory || !editItem) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = {
        name: editName.trim(),
        price: parseFloat(editPrice),
        description: editDesc.trim(),
        category: editCategory,
      };
      await updateDoc(doc(db, 'products', editItem.id), updated);
      setProducts(prev => prev.map(p => p.id === editItem.id ? { ...p, ...updated } : p));
      setEditVisible(false);
      showToast('Product updated!');
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Product) => {
    try {
      await deleteDoc(doc(db, 'products', item.id));
      setProducts(prev => prev.filter(p => p.id !== item.id));
      showToast('Product deleted!');
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
      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍  Search products..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter tabs */}
      {filterTabs.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          style={{ maxHeight: 44 }}
        >
          {filterTabs.map(item => (
            <TouchableOpacity
              key={item}
              style={[styles.filterChip, selectedFilter === item && styles.activeChip]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text style={[styles.filterText, selectedFilter === item && styles.activeFilterText]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Product list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} tintColor="#e94560"
            onRefresh={() => { setRefreshing(true); fetchData(); }} />
        }
        ListHeaderComponent={
          <Text style={styles.countText}>{filtered.length} products</Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.productName}>{item.name}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
              {item.description ? (
                <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
              ) : null}
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
                  <Text style={styles.actionIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
                  <Text style={styles.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* Edit Modal */}
      <Modal visible={editVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit Product</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Product Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholderTextColor="#aaa"
              />

              <Text style={styles.modalLabel}>Price *</Text>
              <TextInput
                style={styles.modalInput}
                value={editPrice}
                onChangeText={setEditPrice}
                keyboardType="decimal-pad"
                placeholderTextColor="#aaa"
              />

              <Text style={styles.modalLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={editDesc}
                onChangeText={setEditDesc}
                multiline
                numberOfLines={3}
                placeholderTextColor="#aaa"
                placeholder="Optional..."
              />

              <Text style={styles.modalLabel}>Category *</Text>
              <View style={styles.categoryGrid}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setEditCategory(cat.name)}
                    style={[
                      styles.categoryChip,
                      editCategory === cat.name && styles.selectedChip,
                    ]}
                  >
                    <Text style={[
                      styles.chipText,
                      editCategory === cat.name && styles.selectedChipText,
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

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
            </ScrollView>
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
  searchBox: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  searchInput: {
    backgroundColor: '#fff', borderRadius: 12, padding: 13,
    fontSize: 15, color: '#1a1a2e', borderWidth: 1.5, borderColor: '#e8e8e8',
  },
  filterList: { paddingHorizontal: 16, paddingVertical: 6, gap: 8, height: 42 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e0e0e0',
  },
  activeChip: { backgroundColor: '#1a1a2e', borderColor: '#1a1a2e' },
  filterText: { fontSize: 13, color: '#555', fontWeight: '500' },
  activeFilterText: { color: '#e94560', fontWeight: '700' },
  list: { padding: 16, gap: 10 },
  countText: { fontSize: 13, color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardLeft: { flex: 1 },
  cardRight: { alignItems: 'flex-end', marginLeft: 10 },
  productName: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  categoryBadge: {
    alignSelf: 'flex-start', backgroundColor: '#fff3f5',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 3,
  },
  categoryBadgeText: { fontSize: 11, color: '#e94560', fontWeight: '700' },
  desc: { fontSize: 12, color: '#aaa' },
  price: { fontSize: 16, fontWeight: 'bold', color: '#e94560', marginBottom: 6 },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 6 },
  actionIcon: { fontSize: 16 },
  // Modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, maxHeight: '85%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 16 },
  modalLabel: {
    fontSize: 12, fontWeight: '700', color: '#888',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  modalInput: {
    borderWidth: 1.5, borderColor: '#e8e8e8', borderRadius: 10,
    padding: 13, fontSize: 15, color: '#1a1a2e',
    marginBottom: 14, backgroundColor: '#fafafa',
  },
  modalTextArea: { height: 70, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#e0e0e0', backgroundColor: '#fafafa',
  },
  selectedChip: { backgroundColor: '#1a1a2e', borderColor: '#1a1a2e' },
  chipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  selectedChipText: { color: '#e94560', fontWeight: '700' },
  modalButtons: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  modalBtn: { flex: 1, borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f0f4f8', borderWidth: 1.5, borderColor: '#e0e0e0' },
  saveBtn: { backgroundColor: '#e94560' },
  disabled: { opacity: 0.6 },
  cancelBtnText: { color: '#555', fontWeight: '600' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  // Empty
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' },
});