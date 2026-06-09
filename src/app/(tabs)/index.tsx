import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { useProducts } from '@/context/products-context';
import { Product } from '@/data/products';
import { formatDistrict, searchDistricts } from '@/data/districts';

function ProductItem({ item }: { item: Product }) {
  return (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}>
      {item.photoUri ? (
        <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, { backgroundColor: item.color }]} />
      )}
      <View style={styles.info}>
        <ThemedText style={styles.title} numberOfLines={2}>{item.title}</ThemedText>
        <ThemedText style={styles.meta}>{item.location} · {item.timeAgo}</ThemedText>
        <View style={styles.priceRow}>
          <ThemedText style={styles.price}>{item.price}</ThemedText>
          <View style={styles.likesRow}>
            <Ionicons name="heart-outline" size={14} color="#888" />
            <ThemedText style={styles.likes}>{item.likes}</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

export default function HomeScreen() {
  const { products } = useProducts();
  const [location, setLocation] = useState('서울특별시 마포구');
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');

  const filteredDistricts = searchDistricts(locationQuery);

  const openLocationSearch = () => {
    setLocationQuery('');
    setShowLocationSearch(true);
  };

  const selectLocation = (district: string) => {
    setLocation(district);
    setShowLocationSearch(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationButton} activeOpacity={0.7} onPress={openLocationSearch}>
          <ThemedText style={styles.locationText}>{formatDistrict(location)}</ThemedText>
          <Ionicons name="chevron-down" size={18} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="search" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductItem item={item} />}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/sell')}
        activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* 동네 검색 모달 */}
      <Modal
        visible={showLocationSearch}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLocationSearch(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowLocationSearch(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <ThemedText style={styles.sheetTitle}>내 동네 설정</ThemedText>
              <TouchableOpacity onPress={() => setShowLocationSearch(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#ABABAB" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="동/읍/면/구를 검색하세요"
                placeholderTextColor="#ABABAB"
                value={locationQuery}
                onChangeText={setLocationQuery}
                autoFocus
              />
            </View>

            <View style={styles.sheetDivider} />

            <FlatList
              data={filteredDistricts}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = item === location;
                return (
                  <TouchableOpacity
                    style={styles.districtItem}
                    activeOpacity={0.7}
                    onPress={() => selectLocation(item)}>
                    <ThemedText style={[styles.districtText, selected && styles.districtSelected]}>
                      {formatDistrict(item)}
                    </ThemedText>
                    {selected && <Ionicons name="checkmark" size={18} color="#FF6F0F" />}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.sheetDivider} />}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: '#fff',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  list: {
    paddingBottom: 16,
  },
  item: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  thumbnail: {
    width: 110,
    height: 110,
    borderRadius: 10,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: 4,
  },
  title: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  meta: {
    fontSize: 13,
    color: '#888',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  likes: {
    fontSize: 13,
    color: '#888',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6F0F',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  // 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    padding: 0,
  },
  sheetDivider: { height: 1, backgroundColor: '#F0F0F0' },
  districtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  districtText: { fontSize: 16, color: '#1A1A1A' },
  districtSelected: { color: '#FF6F0F', fontWeight: '600' },
});
