import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { BG, CORAL, CORAL_SOFT, CORAL_SOFT2, INK, INK2, INK3, LINE, LINE2, SURFACE } from '@/constants/theme';

type UserRow = {
  id: string;
  email: string;
  tier: 'free' | 'paid';
  role: 'admin' | 'user';
  created_at: string;
};

type ProfileRow = {
  id: string;
  email: string;
  nickname: string;
  manner_temp: number;
  created_at: string;
};

type MergedMember = {
  id: string;
  email: string;
  nickname: string;
  tier: 'free' | 'paid';
  role: 'admin' | 'user';
  created_at: string;
};

function mergeMembers(users: UserRow[], profiles: ProfileRow[]): MergedMember[] {
  const nicknameById = new Map(profiles.map((p) => [p.id, p.nickname]));
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    nickname: nicknameById.get(u.id) ?? '(닉네임 없음)',
    tier: u.tier,
    role: u.role,
    created_at: u.created_at,
  }));
}

export default function AdminScreen() {
  const { account, loading: authLoading } = useAuth();
  const [members, setMembers] = useState<MergedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    const [usersRes, profilesRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('profiles').select('*'),
    ]);
    if (usersRes.data && profilesRes.data) {
      setMembers(mergeMembers(usersRes.data, profilesRes.data));
    }
    setLoading(false);
  }

  async function toggleTier(member: MergedMember) {
    const newTier = member.tier === 'paid' ? 'free' : 'paid';
    setUpdatingId(member.id);
    const { error } = await supabase.from('users').update({ tier: newTier }).eq('id', member.id);
    if (!error) {
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, tier: newTier } : m))
      );
    }
    setUpdatingId(null);
  }

  if (authLoading) return null;
  if (account?.role !== 'admin') return <Redirect href="/my-daangn" />;

  const paidMembers = members.filter((m) => m.tier === 'paid');
  const freeMembers = members.filter((m) => m.tier === 'free');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>관리자</ThemedText>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={CORAL} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>유료회원 ({paidMembers.length})</ThemedText>
            {paidMembers.length === 0 ? (
              <ThemedText style={styles.emptyText}>유료회원이 없어요.</ThemedText>
            ) : (
              paidMembers.map((m) => (
                <MemberCard key={m.id} member={m} busy={updatingId === m.id} onToggle={() => toggleTier(m)} />
              ))
            )}
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>무료회원 ({freeMembers.length})</ThemedText>
            {freeMembers.length === 0 ? (
              <ThemedText style={styles.emptyText}>무료회원이 없어요.</ThemedText>
            ) : (
              freeMembers.map((m) => (
                <MemberCard key={m.id} member={m} busy={updatingId === m.id} onToggle={() => toggleTier(m)} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function MemberCard({
  member,
  busy,
  onToggle,
}: {
  member: MergedMember;
  busy: boolean;
  onToggle: () => void;
}) {
  const isPaid = member.tier === 'paid';

  return (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.cardTitleRow}>
          <ThemedText style={styles.nickname}>{member.nickname}</ThemedText>
          <View style={[styles.tierBadge, isPaid ? styles.tierBadgePaid : styles.tierBadgeFree]}>
            <ThemedText style={[styles.tierBadgeText, isPaid && styles.tierBadgeTextPaid]}>
              {isPaid ? '유료' : '무료'}
            </ThemedText>
          </View>
          {member.role === 'admin' && (
            <View style={styles.adminBadge}>
              <ThemedText style={styles.adminBadgeText}>관리자</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={styles.email}>{member.email}</ThemedText>
      </View>

      <TouchableOpacity
        style={[styles.toggleButton, isPaid ? styles.toggleButtonOutline : styles.toggleButtonFilled]}
        activeOpacity={0.8}
        disabled={busy}
        onPress={onToggle}>
        {busy ? (
          <ActivityIndicator size="small" color={isPaid ? INK2 : '#FFFFFF'} />
        ) : (
          <ThemedText style={[styles.toggleButtonText, isPaid && styles.toggleButtonTextOutline]}>
            {isPaid ? '무료로 변경' : '유료로 변경'}
          </ThemedText>
        )}
      </TouchableOpacity>
    </View>
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
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: INK, marginBottom: 10 },
  emptyText: { fontSize: 13, color: INK3, paddingVertical: 8 },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LINE,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardInfo: { flex: 1, gap: 4 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nickname: { fontSize: 15, fontWeight: '700', color: INK },
  email: { fontSize: 12, color: INK2 },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierBadgeFree: { backgroundColor: LINE },
  tierBadgePaid: { backgroundColor: CORAL_SOFT2 },
  tierBadgeText: { fontSize: 11, fontWeight: '600', color: INK3 },
  tierBadgeTextPaid: { color: CORAL },
  adminBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: CORAL_SOFT,
  },
  adminBadgeText: { fontSize: 11, fontWeight: '600', color: CORAL },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 92,
  },
  toggleButtonFilled: { backgroundColor: CORAL },
  toggleButtonOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: LINE2 },
  toggleButtonText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  toggleButtonTextOutline: { color: INK2 },
});
