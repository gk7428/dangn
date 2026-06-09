import { Ionicons } from '@expo/vector-icons';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

type Post = {
  id: string;
  category: string;
  title: string;
  preview: string;
  location: string;
  timeAgo: string;
  comments: number;
  likes: number;
  categoryColor: string;
};

const POSTS: Post[] = [
  {
    id: '1',
    category: '동네질문',
    title: '합정역 근처 맛집 추천해주세요',
    preview: '이사온 지 얼마 안 돼서 맛집을 잘 모르는데요. 점심에 혼자 가도 부담 없는 곳 있을까요?',
    location: '마포구 합정동',
    timeAgo: '5분 전',
    comments: 3,
    likes: 12,
    categoryColor: '#E8F4FF',
  },
  {
    id: '2',
    category: '생활정보',
    title: '마포구 재활용 쓰레기 수거일 안내',
    preview: '마포구 합정동 재활용 쓰레기 수거일이 바뀌었습니다. 화요일, 목요일로 변경되었으니 참고하세요.',
    location: '마포구 합정동',
    timeAgo: '23분 전',
    comments: 8,
    likes: 34,
    categoryColor: '#E8FFE8',
  },
  {
    id: '3',
    category: '동네맛집',
    title: '연남동 새로 생긴 카페 다녀왔어요',
    preview: '연남동 경의선 숲길 근처에 새로 생긴 카페인데 분위기도 너무 좋고 커피도 맛있었어요. 강추!',
    location: '마포구 연남동',
    timeAgo: '1시간 전',
    comments: 15,
    likes: 47,
    categoryColor: '#FFF8E1',
  },
  {
    id: '4',
    category: '분실·실종',
    title: '흰 고양이 찾습니다',
    preview: '어제 저녁 합정동 골목에서 흰색 고양이를 잃어버렸어요. 파란 목걸이 하고 있어요. 보신 분 연락 부탁드립니다.',
    location: '마포구 합정동',
    timeAgo: '2시간 전',
    comments: 6,
    likes: 23,
    categoryColor: '#FFE8E8',
  },
  {
    id: '5',
    category: '동네소식',
    title: '망원 한강공원 산책로 공사 안내',
    preview: '망원 한강공원 산책로가 이번 주부터 3주간 보수 공사로 일부 구간이 통제됩니다. 이용에 참고하세요.',
    location: '마포구 망원동',
    timeAgo: '3시간 전',
    comments: 2,
    likes: 18,
    categoryColor: '#E8E8FF',
  },
  {
    id: '6',
    category: '동네질문',
    title: '주변에 세탁소 어디가 좋나요?',
    preview: '코트 드라이클리닝 맡기려는데 합정역 근처에 믿을 만한 세탁소 아시는 분 계세요?',
    location: '마포구 합정동',
    timeAgo: '5시간 전',
    comments: 11,
    likes: 5,
    categoryColor: '#E8F4FF',
  },
];

const CATEGORIES = ['전체', '동네질문', '생활정보', '분실·실종', '동네사건사고', '동네맛집', '동네소식'];

function PostItem({ item }: { item: Post }) {
  return (
    <TouchableOpacity style={styles.postItem} activeOpacity={0.7}>
      <View style={[styles.categoryBadge, { backgroundColor: item.categoryColor }]}>
        <ThemedText style={styles.categoryBadgeText}>{item.category}</ThemedText>
      </View>
      <ThemedText style={styles.postTitle} numberOfLines={2}>{item.title}</ThemedText>
      <ThemedText style={styles.postPreview} numberOfLines={2}>{item.preview}</ThemedText>
      <View style={styles.postMeta}>
        <ThemedText style={styles.postLocation}>{item.location} · {item.timeAgo}</ThemedText>
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={13} color="#888" />
            <ThemedText style={styles.statText}>{item.comments}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={13} color="#888" />
            <ThemedText style={styles.statText}>{item.likes}</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CommunityScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationButton} activeOpacity={0.7}>
          <ThemedText style={styles.headerTitle}>서울시 마포구</ThemedText>
          <Ionicons name="chevron-down" size={18} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="search" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="create-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
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
        data={POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostItem item={item} />}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Ionicons name="create-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  locationButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
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
  list: { paddingBottom: 100 },
  postItem: { paddingHorizontal: 16, paddingVertical: 16, gap: 6 },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryBadgeText: { fontSize: 12, color: '#555', fontWeight: '500' },
  postTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', lineHeight: 21 },
  postPreview: { fontSize: 14, color: '#666', lineHeight: 20 },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  postLocation: { fontSize: 12, color: '#AAA' },
  postStats: { flexDirection: 'row', gap: 10 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontSize: 12, color: '#888' },
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
});
