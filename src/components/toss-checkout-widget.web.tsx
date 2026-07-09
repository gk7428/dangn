import type { PaymentWidgetInstance } from '@tosspayments/payment-widget__types';
import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

const CORAL = '#FF5A4D';
const INK = '#2A2723';
const INK2 = '#6E675F';
const LINE2 = '#E4DCD1';

// 웹은 네이티브 SDK 대신 토스페이먼츠 결제위젯 JavaScript SDK를 쓴다.
// 이 패키지는 번들에 SDK 코드를 포함하지 않고, 로드 시점에
// https://js.tosspayments.com/v1/payment-widget 스크립트를 동적으로 삽입한다.
const TOSS_CLIENT_KEY = process.env.EXPO_PUBLIC_TOSS_CLIENT_KEY ?? 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';

const PAYMENT_METHODS_SELECTOR = 'toss-payment-methods';
const AGREEMENT_SELECTOR = 'toss-agreement';

function generateOrderId(): string {
  return `order_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

// react-native-web의 Alert.alert()는 빈 함수라 웹에서는 아무 것도 뜨지 않는다.
// 웹 전용 파일이므로 브라우저 window.alert로 대체한다.
function webAlert(title: string, message?: string) {
  window.alert(message ? `${title}\n${message}` : title);
}

type Props = {
  customerId: string;
  customerEmail?: string;
  customerName?: string;
  initialOrderName?: string;
  initialAmount?: number;
  lockAmount?: boolean;
};

export default function TossCheckoutWidget({
  customerId,
  customerEmail,
  customerName,
  initialOrderName,
  initialAmount,
  lockAmount,
}: Props) {
  const [amountText, setAmountText] = useState(String(initialAmount ?? 10000));
  const [orderName, setOrderName] = useState(initialOrderName ?? '토스페이먼츠 테스트 상품');
  const [widgetReady, setWidgetReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<ReturnType<PaymentWidgetInstance['renderPaymentMethods']> | null>(null);
  const agreementWidgetRef = useRef<ReturnType<PaymentWidgetInstance['renderAgreement']> | null>(null);

  const amountValue = Number(amountText.replace(/[^0-9]/g, '')) || 0;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const widget = await loadPaymentWidget(TOSS_CLIENT_KEY, customerId);
      if (cancelled) return;

      paymentWidgetRef.current = widget;

      const methodsWidget = widget.renderPaymentMethods(
        `#${PAYMENT_METHODS_SELECTOR}`,
        { value: amountValue },
        { variantKey: 'DEFAULT' },
      );
      paymentMethodsWidgetRef.current = methodsWidget;
      methodsWidget.on('ready', () => {
        if (!cancelled) setWidgetReady(true);
      });

      agreementWidgetRef.current = widget.renderAgreement(`#${AGREEMENT_SELECTOR}`, { variantKey: 'DEFAULT' });
    })();

    return () => {
      cancelled = true;
    };
    // 결제위젯은 최초 마운트 시 한 번만 초기화한다. customerId는 화면 진입 동안 바뀌지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  useEffect(() => {
    paymentMethodsWidgetRef.current?.updateAmount(amountValue);
  }, [amountValue]);

  async function handlePay() {
    // handlePay는 onPress에서 await 없이 호출되므로, try로 감싸지 않은 동기 예외는
    // 콘솔에만 찍히는 unhandled promise rejection이 되어 화면엔 아무 반응도 없는 것처럼
    // 보인다. 어떤 단계에서 실패하든 항상 눈에 보이는 알림이 뜨도록 전체를 감싼다.
    try {
      if (!widgetReady || !paymentWidgetRef.current || !agreementWidgetRef.current) {
        webAlert('결제위젯이 아직 준비되지 않았어요.');
        return;
      }
      if (amountValue <= 0) {
        webAlert('결제 금액을 입력해주세요.');
        return;
      }

      const agreement = agreementWidgetRef.current.getAgreementStatus();
      if (!agreement.agreedRequiredTerms) {
        webAlert('필수 약관에 동의해주세요.');
        return;
      }

      setSubmitting(true);
      const orderId = generateOrderId();
      // 웹(특히 모바일 화면)에서는 Promise 방식이 지원되지 않는다.
      // ("모바일 화면에서는 Promise 방식을 지원하지 않습니다.") 그래서 successUrl/failUrl
      // 리다이렉트 방식을 쓴다. 결제 성공 시 successUrl로 이동하며 paymentKey/orderId/amount가
      // 쿼리 파라미터로 전달되고, /payment/success 화면에서 결제 승인을 마무리한다.
      const origin = window.location.origin;
      await paymentWidgetRef.current.requestPayment({
        orderId,
        orderName: orderName || '토스페이먼츠 테스트 결제',
        customerEmail,
        customerName,
        successUrl: `${origin}/payment/success`,
        failUrl: `${origin}/payment/fail`,
      });
      // 결제창이 정상적으로 뜨면 브라우저가 리다이렉트되므로 이 아래로는 내려오지 않는다.
      // 여기로 오면 결제창 자체를 열지 못한 경우다(orderId/orderName 형식 오류 등).
    } catch (err) {
      const code = (err as { code?: string } | undefined)?.code;
      if (code === 'USER_CANCEL') return;
      const message = err instanceof Error ? err.message : String(err);
      webAlert('결제 중 오류가 발생했어요.', message);
      // eslint-disable-next-line no-console
      console.error('[toss] handlePay failed', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <ThemedText style={styles.label}>주문명</ThemedText>
            <TextInput
              value={orderName}
              onChangeText={setOrderName}
              editable={!lockAmount}
              style={[styles.input, lockAmount && styles.inputLocked]}
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
                editable={!lockAmount}
                keyboardType="number-pad"
                style={[styles.input, { flex: 1 }, lockAmount && styles.inputLocked]}
                placeholder="10000"
                placeholderTextColor={INK2}
              />
              <ThemedText style={styles.won}>원</ThemedText>
            </View>
          </View>

          <View style={styles.widgetSection} nativeID={PAYMENT_METHODS_SELECTOR} />
          <View style={styles.widgetSection} nativeID={AGREEMENT_SELECTOR} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, (submitting || !widgetReady) && styles.payButtonDisabled]}
          activeOpacity={0.8}
          disabled={submitting || !widgetReady}
          onPress={handlePay}
        >
          <ThemedText style={styles.payButtonText}>
            {submitting ? '결제 처리 중...' : !widgetReady ? '결제위젯 불러오는 중...' : `${amountValue.toLocaleString()}원 결제하기`}
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
  inputLocked: {
    backgroundColor: '#F6F3EE',
    color: INK2,
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
