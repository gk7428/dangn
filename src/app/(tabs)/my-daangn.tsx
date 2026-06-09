import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

const MANNER_TEMP = 36.5;
const TEMP_FILL = `${(MANNER_TEMP / 100) * 100}%` as const;

const TRADE_MENU = ['판매내역', '구매내역', '관심목록', '나눔내역'];
const ACTIVITY_MENU = ['동네생활 글', '동네생활 댓글'];
const ETC_MENU = ['설정', '고객센터'];

function MenuItem({ label }: { label: string }) {
  return (
    <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
      <ThemedText style={styles.menuLabel}>{label}</ThemedText>
      <Ionicons name="chevron-forward" size={18} color="#ABABAB" />
    </TouchableOpacity>
  );
}

export default function MyDaangnScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>나의당근</ThemedText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 프로필 */}
        <View style={styles.profileSection}>
          <View style={styles.profileLeft}>
            <View style={styles.avatar} />
            <View>
              <ThemedText style={styles.nickname}>당근유저</ThemedText>
              <ThemedText style={styles.location}>서울시 마포구</ThemedText>
            </View>
          </View>
          <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
            <ThemedText style={styles.profileButtonText}>프로필 보기</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        {/* 매너온도 */}
        <View style={styles.mannerSection}>
          <View style={styles.mannerTop}>
            <View>
              <ThemedText style={styles.mannerTemp}>{MANNER_TEMP}°</ThemedText>
              <ThemedText style={styles.mannerLabel}>따뜻한 온도에요 🌡️</ThemedText>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <ThemedText style={styles.mannerLink}>매너온도란?</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: TEMP_FILL }]} />
          </View>
        </View>

        <View style={styles.sectionDivider} />

        {/* 나의 거래 */}
        <View style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>나의 거래</ThemedText>
          {TRADE_MENU.map((label) => <MenuItem key={label} label={label} />)}
        </View>

        <View style={styles.sectionDivider} />

        {/* 나의 활동 */}
        <View style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>나의 활동</ThemedText>
          {ACTIVITY_MENU.map((label) => <MenuItem key={label} label={label} />)}
        </View>

        <View style={styles.sectionDivider} />

        {/* 기타 */}
        <View style={styles.menuSection}>
          {ETC_MENU.map((label) => <MenuItem key={label} label={label} />)}
        </View>

        <View style={styles.sectionDivider} />
      </ScrollView>
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
  headerTitle: { fontSize: 17, fontWeight: '700' },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFB380',
  },
  nickname: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  location: { fontSize: 13, color: '#888', marginTop: 3 },
  profileButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  profileButtonText: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  sectionDivider: { height: 8, backgroundColor: '#F4F4F4' },
  mannerSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  mannerTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  mannerTemp: { fontSize: 26, fontWeight: '700', color: '#FF6F0F' },
  mannerLabel: { fontSize: 14, color: '#555', marginTop: 2 },
  mannerLink: { fontSize: 13, color: '#888', textDecorationLine: 'underline' },
  progressBg: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#FF6F0F',
    borderRadius: 4,
  },
  menuSection: { paddingVertical: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ABABAB',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuLabel: { fontSize: 16, color: '#1A1A1A' },
});
