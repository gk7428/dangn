import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
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
  const { signOut, session, profile, account, redeemReferral } = useAuth();
  const email = session?.user?.email ?? '';
  const nickname = profile?.nickname ?? '부산유저';
  const mannerTemp = profile?.manner_temp ?? DEFAULT_MANNER_TEMP;
  const tempFill = `${(mannerTemp / 100) * 100}%` as const;
  const isAdmin = account?.role === 'admin';
  const roleLabel = isAdmin ? '관리자' : '일반회원';
  const tierLabel = account?.tier === 'paid' ? '유료회원' : '무료회원';

  const points = profile?.points ?? 0;
  const myCode = profile?.referral_code ?? '';
  const alreadyReferred = !!profile?.referred_by;

  const [codeInput, setCodeInput] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 추천 코드를 클립보드에 복사하고, 잠시 "복사됨" 표시를 보여준다.
  async function copyCode() {
    if (!myCode) return;
    await Clipboard.setStringAsync(myCode);
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 1500);
  }

  async function handleRedeem() {
    if (redeeming) return;
    setRedeemMsg(null);
    setRedeeming(true);
    const err = await redeemReferral(codeInput);
    setRedeeming(false);
    if (err) {
      setRedeemMsg({ ok: false, text: err });
    } else {
      setCodeInput('');
      setRedeemMsg({ ok: true, text: '추천 코드가 적용됐어요! 1,000P가 지급됐어요 🎉' });
    }
  }

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

        {/* 포인트 */}
        <View style={styles.pointSection}>
          <View style={styles.pointHeader}>
            <View style={styles.pointLabelRow}>
              <Ionicons name="wallet-outline" size={18} color={CORAL} />
              <ThemedText style={styles.pointLabel}>내 포인트</ThemedText>
            </View>
            <ThemedText style={styles.pointValue}>{points.toLocaleString()}P</ThemedText>
          </View>
        </View>

        <View style={styles.sectionDivider} />

        {/* 친구 초대 */}
        <View style={styles.inviteSection}>
          <ThemedText style={styles.inviteTitle}>친구 초대</ThemedText>
          <ThemedText style={styles.inviteDesc}>
            친구가 내 추천코드로 가입하면 둘 다 1,000P를 받아요 🎁
          </ThemedText>

          <View style={styles.codeBox}>
            <View>
              <ThemedText style={styles.codeCaption}>내 추천 코드</ThemedText>
              <ThemedText style={styles.codeValue}>{myCode || '—'}</ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.shareButton, !myCode && styles.shareButtonDisabled]}
              activeOpacity={0.8}
              disabled={!myCode}
              onPress={copyCode}
            >
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color="#fff" />
              <ThemedText style={styles.shareButtonText}>{copied ? '복사됨' : '복사하기'}</ThemedText>
            </TouchableOpacity>
          </View>

          {/* 추천 코드 입력 (아직 추천 코드를 쓰지 않은 사용자만) */}
          {alreadyReferred ? (
            <View style={styles.redeemedRow}>
              <Ionicons name="checkmark-circle" size={16} color="#2E9E5B" />
              <ThemedText style={styles.redeemedText}>추천 코드를 이미 사용했어요.</ThemedText>
            </View>
          ) : (
            <View style={styles.redeemArea}>
              <ThemedText style={styles.codeCaption}>추천 코드 입력</ThemedText>
              <View style={styles.redeemRow}>
                <TextInput
                  style={styles.redeemInput}
                  value={codeInput}
                  onChangeText={(t) => setCodeInput(t.toUpperCase())}
                  placeholder="친구의 추천 코드"
                  placeholderTextColor={INK3}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={12}
                />
                <TouchableOpacity
                  style={[styles.redeemButton, (redeeming || !codeInput.trim()) && styles.redeemButtonDisabled]}
                  activeOpacity={0.8}
                  disabled={redeeming || !codeInput.trim()}
                  onPress={handleRedeem}
                >
                  <ThemedText style={styles.redeemButtonText}>{redeeming ? '확인 중' : '확인'}</ThemedText>
                </TouchableOpacity>
              </View>
              {redeemMsg && (
                <ThemedText style={[styles.redeemMsg, redeemMsg.ok ? styles.redeemMsgOk : styles.redeemMsgErr]}>
                  {redeemMsg.text}
                </ThemedText>
              )}
            </View>
          )}
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
  pointSection: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
  },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pointLabel: { fontSize: 15, fontWeight: '600', color: INK },
  pointValue: { fontSize: 22, fontWeight: '800', color: CORAL },
  inviteSection: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  inviteTitle: { fontSize: 15, fontWeight: '700', color: INK },
  inviteDesc: { fontSize: 13, color: INK2, lineHeight: 19 },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  codeCaption: { fontSize: 12, color: INK2, marginBottom: 2 },
  codeValue: { fontSize: 20, fontWeight: '800', color: INK, letterSpacing: 2 },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CORAL,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  shareButtonDisabled: { opacity: 0.5 },
  shareButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  redeemArea: { gap: 6 },
  redeemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  redeemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: LINE2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: INK,
    letterSpacing: 1,
  },
  redeemButton: {
    backgroundColor: INK,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  redeemButtonDisabled: { opacity: 0.4 },
  redeemButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  redeemMsg: { fontSize: 13, marginTop: 2 },
  redeemMsgOk: { color: '#2E9E5B' },
  redeemMsgErr: { color: CORAL },
  redeemedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  redeemedText: { fontSize: 13, color: INK2 },
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
