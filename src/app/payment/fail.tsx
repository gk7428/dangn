import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

const CORAL = '#FF5A4D';
const INK = '#2A2723';
const INK2 = '#6E675F';

// 토스페이먼츠 결제위젯(웹)은 결제 실패/취소 시 이 화면으로 리다이렉트하며
// code/message/orderId를 쿼리 파라미터로 전달한다.
export default function PaymentFailScreen() {
  const { code, message } = useLocalSearchParams<{ code?: string; message?: string; orderId?: string }>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Ionicons name="close-circle" size={72} color={CORAL} />
        <ThemedText style={styles.title}>결제에 실패했어요</ThemedText>
        <ThemedText style={styles.desc}>{message ?? '결제가 취소되었거나 처리 중 오류가 발생했어요.'}</ThemedText>
        {code ? <ThemedText style={styles.code}>오류 코드: {code}</ThemedText> : null}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => router.replace('/')}>
          <ThemedText style={styles.buttonText}>홈으로 돌아가기</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: '700', color: INK, marginTop: 8 },
  desc: { fontSize: 15, color: INK2, textAlign: 'center', lineHeight: 22 },
  code: { fontSize: 13, color: INK2, marginTop: 4 },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: CORAL,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
