import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useProducts } from '@/context/products-context';

const CORAL = '#FF5A4D';
const INK = '#2A2723';
const INK2 = '#6E675F';
const INK3 = '#A49C92';
const LINE = '#F0EBE3';
const LINE2 = '#E4DCD1';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products } = useProducts();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText>상품을 찾을 수 없습니다.</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color={INK} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={24} color={INK} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="share-outline" size={24} color={INK} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="ellipsis-vertical" size={24} color={INK} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {product.photoUri ? (
          <Image source={{ uri: product.photoUri }} style={styles.imagePlaceholder} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: product.color }]} />
        )}

        <View style={styles.sellerRow}>
          <View style={styles.sellerAvatar} />
          <View>
            <ThemedText style={styles.sellerName}>판매자닉네임</ThemedText>
            <ThemedText style={styles.sellerLocation}>{product.location}</ThemedText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.body}>
          <ThemedText style={styles.title}>{product.title}</ThemedText>
          <ThemedText style={styles.meta}>{product.location} · {product.timeAgo}</ThemedText>
          <ThemedText style={styles.description}>{product.description}</ThemedText>
          <ThemedText style={styles.statsText}>관심 {product.likes} · 조회 128</ThemedText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.7} style={styles.likeButton}>
          <Ionicons name="heart-outline" size={24} color={INK} />
          <ThemedText style={styles.footerPrice}>{product.price}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatButton} activeOpacity={0.8}>
          <ThemedText style={styles.chatButtonText}>채팅으로 거래하기</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: LINE2,
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 4,
  },
  scroll: {
    flex: 1,
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D0CCC8',
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '600',
    color: INK,
  },
  sellerLocation: {
    fontSize: 13,
    color: INK2,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: LINE,
    marginHorizontal: 16,
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
    lineHeight: 26,
  },
  meta: {
    fontSize: 13,
    color: INK2,
  },
  description: {
    fontSize: 15,
    color: INK2,
    lineHeight: 22,
    marginTop: 8,
  },
  statsText: {
    fontSize: 13,
    color: INK3,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: LINE2,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  likeButton: {
    alignItems: 'center',
    gap: 4,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: LINE2,
  },
  footerPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
  },
  chatButton: {
    flex: 1,
    backgroundColor: CORAL,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
