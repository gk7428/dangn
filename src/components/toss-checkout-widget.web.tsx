import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

const INK2 = '#6E675F';

// @tosspayments/widget-sdk-react-native는 네이티브(iOS/Android) 전용 SDK라
// 웹 번들에 포함되면 Metro 번들링이 깨진다. 웹에서는 안내만 보여준다.
type Props = {
  customerId: string;
  customerEmail?: string;
  customerName?: string;
};

export default function TossCheckoutWidget(_props: Props) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.message}>
        토스페이먼츠 결제위젯은 iOS/Android 앱에서만 사용할 수 있어요.{'\n'}
        개발용 빌드(dev client)에서 확인해주세요.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { fontSize: 15, color: INK2, textAlign: 'center', lineHeight: 22 },
});
