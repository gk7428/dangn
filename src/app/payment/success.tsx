import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';

const CORAL = '#FF5A4D';
const INK = '#2A2723';
const INK2 = '#6E675F';
const GREEN = '#2E9E5B';

type Status = 'confirming' | 'success' | 'error';

// 토스페이먼츠 결제위젯(웹)은 결제 성공 시 이 화면으로 리다이렉트하며
// paymentKey/orderId/amount를 쿼리 파라미터로 전달한다. 실제 결제 승인은
// 시크릿 키가 필요하므로 여기서 Supabase Edge Function(toss-confirm)을 호출해
// 서버에서 마무리한다.
export default function PaymentSuccessScreen() {
  const { paymentKey, orderId, amount } = useLocalSearchParams<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
  }>();

  const [status, setStatus] = useState<Status>('confirming');
  const [message, setMessage] = useState('');
  const confirmedRef = useRef(false);

  useEffect(() => {
    // 리다이렉트로 새로 로드된 화면이라 파라미터가 채워진 뒤 한 번만 승인한다.
    if (confirmedRef.current) return;
    if (!paymentKey || !orderId || !amount) return;
    confirmedRef.current = true;

    (async () => {
      try {
        // 리다이렉트 직후에는 세션이 복원되기 전일 수 있어 명시적으로 먼저 불러온다.
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setStatus('error');
          setMessage('로그인이 만료되었어요. 다시 로그인 후 시도해주세요.');
          return;
        }

        const { data, error } = await supabase.functions.invoke('toss-confirm', {
          body: { paymentKey, orderId, amount: Number(amount) },
        });

        if (error || data?.error) {
          setStatus('error');
          setMessage(error?.message ?? data?.error ?? '결제 승인에 실패했어요.');
          return;
        }

        setStatus('success');
        setMessage(`${Number(amount).toLocaleString()}원 결제가 승인됐어요.`);
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : '결제 승인 중 오류가 발생했어요.');
      }
    })();
  }, [paymentKey, orderId, amount]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {status === 'confirming' && (
          <>
            <ActivityIndicator size="large" color={CORAL} />
            <ThemedText style={styles.title}>결제를 확인하고 있어요</ThemedText>
            <ThemedText style={styles.desc}>잠시만 기다려주세요.</ThemedText>
          </>
        )}

        {status === 'success' && (
          <>
            <Ionicons name="checkmark-circle" size={72} color={GREEN} />
            <ThemedText style={styles.title}>결제 완료</ThemedText>
            <ThemedText style={styles.desc}>{message}</ThemedText>
          </>
        )}

        {status === 'error' && (
          <>
            <Ionicons name="alert-circle" size={72} color={CORAL} />
            <ThemedText style={styles.title}>결제 승인 실패</ThemedText>
            <ThemedText style={styles.desc}>{message}</ThemedText>
          </>
        )}
      </View>

      {status !== 'confirming' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => router.replace('/')}>
            <ThemedText style={styles.buttonText}>홈으로 돌아가기</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: '700', color: INK, marginTop: 8 },
  desc: { fontSize: 15, color: INK2, textAlign: 'center', lineHeight: 22 },
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
