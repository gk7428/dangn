import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import {
  AgreementWidget,
  PaymentMethodWidget,
  PaymentWidgetProvider,
  usePaymentWidget,
} from '@tosspayments/widget-sdk-react-native';
import type { AgreementWidgetControl, PaymentMethodWidgetControl } from '@tosspayments/widget-sdk-react-native';

import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';

const CORAL = '#FF5A4D';
const INK = '#2A2723';
const INK2 = '#6E675F';
const LINE2 = '#E4DCD1';

// 회원가입 없이 쓸 수 있는 토스페이먼츠 문서 제공 결제위젯 테스트 클라이언트 키.
// 실제 상점 키가 발급되면 EXPO_PUBLIC_TOSS_CLIENT_KEY 환경변수로 교체하세요.
const TOSS_CLIENT_KEY = process.env.EXPO_PUBLIC_TOSS_CLIENT_KEY ?? 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';

function generateOrderId(): string {
  return `order_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

type Props = {
  customerId: string;
  customerEmail?: string;
  customerName?: string;
};

export default function TossCheckoutWidget({ customerId, customerEmail, customerName }: Props) {
  return (
    <PaymentWidgetProvider clientKey={TOSS_CLIENT_KEY} customerKey={customerId}>
      <CheckoutContent customerEmail={customerEmail} customerName={customerName} />
    </PaymentWidgetProvider>
  );
}

function CheckoutContent({ customerEmail, customerName }: { customerEmail?: string; customerName?: string }) {
  const paymentWidgetControl = usePaymentWidget();
  const [amountText, setAmountText] = useState('10000');
  const [orderName, setOrderName] = useState('토스페이먼츠 테스트 상품');
  const [paymentMethodWidgetControl, setPaymentMethodWidgetControl] = useState<PaymentMethodWidgetControl | null>(null);
  const [agreementWidgetControl, setAgreementWidgetControl] = useState<AgreementWidgetControl | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const amountValue = Number(amountText.replace(/[^0-9]/g, '')) || 0;

  async function applyAmount() {
    if (!paymentMethodWidgetControl) return;
    await paymentMethodWidgetControl.updateAmount(amountValue);
  }

  async function handlePay() {
    if (!paymentWidgetControl || !paymentMethodWidgetControl || !agreementWidgetControl) {
      Alert.alert('결제위젯이 아직 준비되지 않았어요.');
      return;
    }
    if (amountValue <= 0) {
      Alert.alert('결제 금액을 입력해주세요.');
      return;
    }

    const agreement = await agreementWidgetControl.getAgreementStatus();
    if (!agreement.agreedRequiredTerms) {
      Alert.alert('필수 약관에 동의해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const orderId = generateOrderId();
      const result = await paymentWidgetControl.requestPayment?.({
        orderId,
        orderName: orderName || '토스페이먼츠 테스트 결제',
        customerEmail,
        customerName,
      });

      if (result?.success) {
        const { paymentKey, orderId: confirmedOrderId, amount } = result.success;
        const { data, error } = await supabase.functions.invoke('toss-confirm', {
          body: { paymentKey, orderId: confirmedOrderId, amount },
        });

        if (error || data?.error) {
          Alert.alert('결제 승인 실패', error?.message ?? data?.error ?? '알 수 없는 오류가 발생했어요.');
          return;
        }

        Alert.alert('결제 완료', `${amount.toLocaleString()}원 결제가 승인됐어요.`, [
          { text: '확인', onPress: () => router.back() },
        ]);
      } else if (result?.fail) {
        Alert.alert('결제 실패', result.fail.message);
      }
    } catch (err) {
      Alert.alert('결제 중 오류가 발생했어요.', err instanceof Error ? err.message : undefined);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <ThemedText style={styles.label}>주문명</ThemedText>
            <TextInput
              value={orderName}
              onChangeText={setOrderName}
              style={styles.input}
              placeholder="주문명을 입력하세요"
              placeholderTextColor={INK2}
            />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>결제 금액</ThemedText>
            <View style={styles.amountRow}>
              <TextInput
                value={amountText}
                onChangeText={setAmountText}
                onBlur={applyAmount}
                keyboardType="number-pad"
                style={[styles.input, { flex: 1 }]}
                placeholder="10000"
                placeholderTextColor={INK2}
              />
              <ThemedText style={styles.won}>원</ThemedText>
            </View>
          </View>

          <View style={styles.widgetSection}>
            <PaymentMethodWidget
              selector="payment-methods"
              onLoadEnd={() => {
                paymentWidgetControl
                  .renderPaymentMethods('payment-methods', { value: amountValue }, { variantKey: 'DEFAULT' })
                  .then(setPaymentMethodWidgetControl);
              }}
            />
          </View>

          <View style={styles.widgetSection}>
            <AgreementWidget
              selector="agreement"
              onLoadEnd={() => {
                paymentWidgetControl
                  .renderAgreement('agreement', { variantKey: 'DEFAULT' })
                  .then(setAgreementWidgetControl);
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, submitting && styles.payButtonDisabled]}
          activeOpacity={0.8}
          disabled={submitting}
          onPress={handlePay}
        >
          <ThemedText style={styles.payButtonText}>
            {submitting ? '결제 처리 중...' : `${amountValue.toLocaleString()}원 결제하기`}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  field: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: INK2 },
  input: {
    borderWidth: 1,
    borderColor: LINE2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: INK,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  won: { fontSize: 15, color: INK },
  widgetSection: { marginTop: 20, minHeight: 240 },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: LINE2,
    backgroundColor: '#FFFFFF',
  },
  payButton: {
    backgroundColor: CORAL,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
