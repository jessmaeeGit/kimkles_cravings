import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { CATEGORIES } from '../data/products';
import { Product, useAppStore } from '../store/AppStore';

export default function Home() {
  const { addToCart, products } = useAppStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');

  const filtered = useMemo(() => {
    return products.filter(p => (
      (p.available !== false) &&
      (category === 'All' || p.category === category) &&
      p.name.toLowerCase().includes(query.trim().toLowerCase())
    ));
  }, [products, query, category]);

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Image source={require('../images/kimkles_logo.png')} style={styles.headerLogo} resizeMode="contain" />
              <Text style={styles.title}>Kimkles Menu</Text>
            </View>
            <TextInput
              placeholder="Search kimkles desserts"
              placeholderTextColor="FEC9F0"
              style={styles.search}
              value={query}
              onChangeText={setQuery}
            />
            <View style={styles.chips}>
              {['All', ...CATEGORIES].map(cat => (
                <TouchableOpacity key={cat} style={[styles.chip, category === cat && styles.chipActive]} onPress={() => setCategory(cat)}>
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => <ProductRow product={item} onAdd={() => addToCart(item)} />}
      />
    </View>
  );
}

function ProductRow({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return (
    <View style={styles.row}>
      {product.image ? (
        <Image source={product.image} style={styles.rowImage} resizeMode="cover" />
      ) : (
        <View style={[styles.rowImage, { backgroundColor: '#F3F4F6' }]} />
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.rowName}>{product.name}</Text>
        <Text style={styles.rowMeta}>{product.category} • ₱{product.price}</Text>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
        <Text style={styles.addText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E4D7FF', padding: 16 },
  title: { fontSize: 18, fontWeight: '500', color: '#111827', marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 1 },
  headerLogo: { width: 80, height: 80 },
  search: { backgroundColor: '#C8F9FD', borderRadius: 12, paddingHorizontal: 12, height: 42, marginBottom: 9 },
  chips: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  chip: { backgroundColor: '#FEC9F0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9999 },
  chipActive: { backgroundColor: '#C8F9FD' },
  chipText: { color: '#6B7280', fontWeight: '700' },
  chipTextActive: { color: '#111827' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C8F9FD', padding: 12, borderRadius: 12, marginBottom: 10 },
  rowImage: { width: 64, height: 64, borderRadius: 12 },
  rowName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  rowMeta: { color: '#6B7280', marginTop: 2 },
  addBtn: { backgroundColor: '#FEC9F0', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 18 },
  addText: { color: '#111827', fontWeight: '800' },
});
