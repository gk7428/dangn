import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { CORAL_SOFT } from '@/constants/theme';

const CORAL = '#FF5A4D';
const BG = '#F6F3EE';
const INK = '#2A2723';
const INK2 = '#6E675F';
const INK3 = '#A49C92';
const LINE2 = '#E4DCD1';

const DEFAULT_MANNER_TEMP = 36.5;

const TRADE_MENU = ['판매내역', '구매내역', '관심목록', '나눔내역'];
const ACTIVITY_MENU = ['동네생활 글', '동네생활 댓글'];
const ETC_MENU = ['설정', '고객센터'];

function MenuItem({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.menuRow} activeOpacity={0.7} onPress={onPress}>
      <ThemedText style={styles.menuLabel}>{label}</ThemedText>
      <Ionicons name="chevron-forward" size={18} color={INK3} />
    </TouchableOpacity>
  );
}

export default function MyBusanScreen() {
  const { signOut, session, profile, account } = useAuth();
  const email = session?.user?.email ?? '';
  const nickname = profile?.nickname ?? '부산유저';
  const mannerTemp = profile?.manner_temp ?? DEFAULT_MANNER_TEMP;
  const tempFill = `${(mannerTemp / 100) * 100}%` as const;
  const isAdmin = account?.role === 'admin';
  const roleLabel = isAdmin ? '관리자' : '일반회원';
  const tierLabel = account?.tier === 'paid' ? '유료회원' : '무료회원';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>나의부산</ThemedText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 프로필 */}
        <View style={styles.profileSection}>
          <View style={styles.profileLeft}>
            <View style={styles.avatar} />
            <View>
              <View style={styles.nicknameRow}>
                <ThemedText style={styles.nickname}>{nickname}</ThemedText>
                <View style={[styles.roleBadge, isAdmin && styles.roleBadgeAdmin]}>
                  <ThemedText style={[styles.roleBadgeText, isAdmin && styles.roleBadgeTextAdmin]}>
                    {roleLabel}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.location}>{email} · {tierLabel}</ThemedText>
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
              <ThemedText style={styles.mannerTemp}>{mannerTemp}°</ThemedText>
              <ThemedText style={styles.mannerLabel}>따뜻한 온도에요 🌡️</ThemedText>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <ThemedText style={styles.mannerLink}>매너온도란?</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: tempFill }]} />
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

        {/* 결제 */}
        <View style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>결제</ThemedText>
          <MenuItem label="결제위젯 테스트" onPress={() => router.push('/checkout')} />
        </View>

        <View style={styles.sectionDivider} />

        {/* 기타 */}
        <View style={styles.menuSection}>
          {ETC_MENU.map((label) => <MenuItem key={label} label={label} />)}
        </View>

        <View style={styles.sectionDivider} />

        {/* 로그아웃 */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuRow} activeOpacity={0.7} onPress={signOut}>
            <ThemedText style={styles.logoutLabel}>로그아웃</ThemedText>
            <Ionicons name="log-out-outline" size={18} color="#FF5A4D" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LINE2,
    backgroundColor: BG,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: INK },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFB380',
  },
  nicknameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nickname: { fontSize: 17, fontWeight: '700', color: INK },
  location: { fontSize: 13, color: INK2, marginTop: 3 },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F0EBE3',
  },
  roleBadgeAdmin: { backgroundColor: CORAL_SOFT },
  roleBadgeText: { fontSize: 11, fontWeight: '600', color: INK2 },
  roleBadgeTextAdmin: { color: CORAL },
  profileButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE2,
  },
  profileButtonText: { fontSize: 14, color: INK, fontWeight: '500' },
  sectionDivider: { height: 8, backgroundColor: BG },
  mannerSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  mannerTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  mannerTemp: { fontSize: 26, fontWeight: '700', color: CORAL },
  mannerLabel: { fontSize: 14, color: INK2, marginTop: 2 },
  mannerLink: { fontSize: 13, color: INK3, textDecorationLine: 'underline' },
  progressBg: {
    height: 8,
    backgroundColor: BG,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: CORAL,
    borderRadius: 4,
  },
  menuSection: { paddingVertical: 8, backgroundColor: '#FFFFFF' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: INK3,
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
  menuLabel: { fontSize: 16, color: INK },
  logoutLabel: { fontSize: 16, color: CORAL },
});
