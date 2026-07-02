import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import TossCheckoutWidget from '@/components/toss-checkout-widget';
import { useAuth } from '@/context/auth-context';

const INK = '#2A2723';
const LINE2 = '#E4DCD1';

export default function CheckoutScreen() {
  const { session, profile, account } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color={INK} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>결제위젯 테스트</ThemedText>
        <View style={styles.backButton} />
      </View>

      {account ? (
        <TossCheckoutWidget
          customerId={account.id}
          customerEmail={session?.user?.email}
          customerName={profile?.nickname}
        />
      ) : (
        <View style={styles.loading}>
          <ThemedText>로그인 정보를 불러오는 중이에요.</ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: LINE2,
  },
  backButton: { padding: 8, width: 42 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: INK },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
