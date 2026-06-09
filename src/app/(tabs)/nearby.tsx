import { Ionicons } from '@expo/vector-icons';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

type Business = {
  id: string;
  name: string;
  category: string;
  distance: string;
  rating: number;
  reviewCount: number;
  color: string;
};

const BUSINESSES: Business[] = [
  {
    id: '1',
    name: '마포구 세탁소',
    category: '동네업체',
    distance: '200m',
    rating: 4.8,
    reviewCount: 47,
    color: '#E3F2FD',
  },
  {
    id: '2',
    name: '합정 부동산',
    category: '부동산',
    distance: '350m',
    rating: 4.6,
    reviewCount: 23,
    color: '#F3E5F5',
  },
  {
    id: '3',
    name: '홍대 브런치 카페',
    category: '동네업체',
    distance: '500m',
    rating: 4.3,
    reviewCount: 89,
    color: '#FFF8E1',
  },
  {
    id: '4',
    name: '연남동 헬스장',
    category: '동네업체',
    distance: '600m',
    rating: 4.7,
    reviewCount: 156,
    color: '#E8F5E9',
  },
  {
    id: '5',
    name: '마포 중고차 직거래',
    category: '중고차',
    distance: '1.2km',
    rating: 4.5,
    reviewCount: 12,
    color: '#ECEFF1',
  },
  {
    id: '6',
    name: '수학 전문 과외',
    category: '과외·클래스',
    distance: '800m',
    rating: 5.0,
    reviewCount: 8,
    color: '#FFE0B2',
  },
];

const CATEGORIES = ['동네업체', '부동산', '중고차', '구인구직', '과외·클래스'];

function BusinessItem({ item }: { item: Business }) {
  return (
    <TouchableOpacity style={styles.businessItem} activeOpacity={0.7}>
      <View style={[styles.businessImage, { backgroundColor: item.color }]} />
      <View style={styles.businessInfo}>
        <ThemedText style={styles.businessName}>{item.name}</ThemedText>
        <ThemedText style={styles.businessMeta}>{item.category} · {item.distance}</ThemedText>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={13} color="#FF6F0F" />
          <ThemedText style={styles.ratingText}>{item.rating.toFixed(1)}</ThemedText>
          <ThemedText style={styles.reviewText}>· 리뷰 {item.reviewCount}개</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function NearbyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>내근처</ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat} style={styles.categoryChip} activeOpacity={0.7}>
            <ThemedText style={styles.categoryChipText}>{cat}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.divider} />

      <FlatList
        data={BUSINESSES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BusinessItem item={item} />}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  categoryScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  categoryChipText: { fontSize: 14, color: '#1A1A1A' },
  divider: { height: 1, backgroundColor: '#F0F0F0' },
  list: { paddingBottom: 16 },
  businessItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    alignItems: 'center',
  },
  businessImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    flexShrink: 0,
  },
  businessInfo: { flex: 1, gap: 4 },
  businessName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  businessMeta: { fontSize: 13, color: '#888' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  reviewText: { fontSize: 13, color: '#888' },
});
