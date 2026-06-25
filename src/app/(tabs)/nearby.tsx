import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

const BG = '#F6F3EE';
const INK = '#2A2723';
const INK3 = '#A49C92';
const LINE2 = '#E4DCD1';

export default function ChatScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>채팅</ThemedText>
      </View>
      <View style={styles.empty}>
        <Ionicons name="chatbubble-ellipses-outline" size={56} color={INK3} />
        <ThemedText style={styles.emptyTitle}>채팅</ThemedText>
        <ThemedText style={styles.emptySubtitle}>이웃과 나눈 대화가 여기에 모여요.</ThemedText>
      </View>
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: INK, marginTop: 8 },
  emptySubtitle: { fontSize: 14, color: INK3, lineHeight: 20 },
});
