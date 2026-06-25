import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useProducts } from '@/context/products-context';
import { Product } from '@/data/products';

const CORAL = '#FF5A4D';
const CORAL_PRESS = '#E8463A';
const INK = '#2A2723';
const INK2 = '#6E675F';
const INK3 = '#A49C92';
const LINE = '#F0EBE3';
const LINE2 = '#E4DCD1';

const MAX_PHOTOS = 10;

const CATEGORIES = [
  '디지털기기',
  '생활가전',
  '가구·인테리어',
  '생활·주방',
  '유아동',
  '여성의류',
  '여성잡화',
  '남성패션·잡화',
  '게임·취미',
  '뷰티·미용',
  '스포츠·레저',
  '반려동물용품',
  '도서·음반',
  '식물',
  '기타 중고물품',
];

export default function SellScreen() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [showCategory, setShowCategory] = useState(false);

  const { addProduct } = useProducts();
  const canSubmit = title.trim().length > 0;

  const handleSubmit = async () => {
    let displayPrice: string;
    if (isFree) {
      displayPrice = '나눔';
    } else {
      const rawPrice = price.trim();
      if (!rawPrice) {
        displayPrice = '가격 미정';
      } else {
        const numeric = parseInt(rawPrice.replace(/\D/g, ''), 10);
        displayPrice = isNaN(numeric) ? '가격 미정' : numeric.toLocaleString('ko-KR') + '원';
      }
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      title: title.trim(),
      location: '마포구 합정동',
      timeAgo: '방금 전',
      price: displayPrice,
      likes: 0,
      color: '#E0D8D0',
      description: description.trim(),
      photoUri: photos.length > 0 ? photos[0] : undefined,
    };

    await addProduct(newProduct);

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleAddPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_PHOTOS - photos.length,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...newUris].slice(0, MAX_PHOTOS));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const selectCategory = (item: string) => {
    setCategory(item);
    setShowCategory(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.closeButton}>
          <Ionicons name="close" size={26} color={INK} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>내 물건 팔기</ThemedText>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.doneButton}
          disabled={!canSubmit}
          onPress={handleSubmit}>
          <ThemedText style={[styles.doneText, !canSubmit && styles.doneTextDisabled]}>완료</ThemedText>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* 사진 영역 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoScroll}>
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity style={styles.photoBox} activeOpacity={0.7} onPress={handleAddPhoto}>
                <Ionicons name="camera-outline" size={24} color={INK3} />
                <ThemedText style={styles.photoCount}>{photos.length}/{MAX_PHOTOS}</ThemedText>
              </TouchableOpacity>
            )}
            {photos.map((uri, index) => (
              <View key={uri} style={styles.photoThumb}>
                <Image source={{ uri }} style={styles.thumbImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePhoto(index)}
                  activeOpacity={0.8}>
                  <Ionicons name="close-circle" size={20} color={INK} />
                </TouchableOpacity>
                {index === 0 && (
                  <View style={styles.representBadge}>
                    <ThemedText style={styles.representText}>대표</ThemedText>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.divider} />

          {/* 제목 */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="제목"
              placeholderTextColor={INK3}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.divider} />

          {/* 카테고리 */}
          <TouchableOpacity
            style={styles.inputRow}
            activeOpacity={0.7}
            onPress={() => setShowCategory(true)}>
            <ThemedText style={[styles.categoryText, category ? styles.categorySelected : null]}>
              {category || '카테고리 선택'}
            </ThemedText>
            <Ionicons name="chevron-forward" size={18} color={INK3} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 가격 + 나눔 토글 */}
          <View style={styles.inputRow}>
            <View style={[styles.priceInputWrap, isFree && styles.priceInputWrapFree]}>
              <ThemedText style={styles.pricePrefix}>₩</ThemedText>
              <TextInput
                style={styles.textInput}
                placeholder={isFree ? '나눔' : '가격 (선택사항)'}
                placeholderTextColor={isFree ? CORAL_PRESS : INK3}
                keyboardType="numeric"
                value={isFree ? '' : price}
                onChangeText={setPrice}
                editable={!isFree}
              />
            </View>
            <TouchableOpacity
              style={[styles.freeButton, isFree && styles.freeButtonActive]}
              activeOpacity={0.8}
              onPress={() => setIsFree((f) => !f)}>
              <ThemedText style={[styles.freeButtonText, isFree && styles.freeButtonTextActive]}>
                나눔
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* 상세 설명 */}
          <View style={[styles.inputRow, styles.descriptionRow]}>
            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              placeholder="자세한 설명 (선택사항)"
              placeholderTextColor={INK3}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.divider} />

          {/* 거래 희망 장소 */}
          <TouchableOpacity style={styles.inputRow} activeOpacity={0.7}>
            <Ionicons name="location-outline" size={20} color={INK2} />
            <ThemedText style={styles.locationText}>거래 희망 장소</ThemedText>
            <ThemedText style={styles.locationValue}>마포구</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={INK3} />
          </TouchableOpacity>

          <View style={styles.divider} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 하단 완료 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          activeOpacity={0.85}
          disabled={!canSubmit}
          onPress={handleSubmit}>
          <ThemedText style={styles.submitText}>작성 완료</ThemedText>
        </TouchableOpacity>
      </View>

      {/* 카테고리 선택 Modal */}
      <Modal
        visible={showCategory}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategory(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowCategory(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <ThemedText style={styles.sheetTitle}>카테고리</ThemedText>
              <TouchableOpacity onPress={() => setShowCategory(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color={INK} />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetDivider} />
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const selected = item === category;
                return (
                  <TouchableOpacity
                    style={styles.categoryItem}
                    activeOpacity={0.7}
                    onPress={() => selectCategory(item)}>
                    <ThemedText style={[styles.categoryItemText, selected && styles.categoryItemSelected]}>
                      {item}
                    </ThemedText>
                    {selected && <Ionicons name="checkmark" size={18} color={CORAL} />}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.sheetDivider} />}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  closeButton: { padding: 8 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: INK },
  doneButton: { padding: 8 },
  doneText: { fontSize: 16, fontWeight: '600', color: CORAL },
  doneTextDisabled: { color: INK3 },
  scroll: { flex: 1 },
  photoScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  photoBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LINE2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FAFAFA',
  },
  photoCount: { fontSize: 11, color: INK3 },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImage: { width: 80, height: 80, borderRadius: 8 },
  removeButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  representBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  representText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  divider: { height: 1, backgroundColor: LINE },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  descriptionRow: { alignItems: 'flex-start', paddingVertical: 14 },
  textInput: { flex: 1, fontSize: 16, color: INK, padding: 0 },
  pricePrefix: { fontSize: 16, color: INK2 },
  priceInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: LINE2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  priceInputWrapFree: {
    backgroundColor: '#FAFAFA',
  },
  freeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LINE2,
    backgroundColor: '#FFFFFF',
  },
  freeButtonActive: {
    borderColor: CORAL,
    backgroundColor: CORAL,
  },
  freeButtonText: { fontSize: 14, fontWeight: '700', color: INK2 },
  freeButtonTextActive: { color: '#FFFFFF' },
  descriptionInput: { minHeight: 100 },
  categoryText: { flex: 1, fontSize: 16, color: INK3 },
  categorySelected: { color: INK },
  locationText: { flex: 1, fontSize: 16, color: INK },
  locationValue: { fontSize: 15, color: CORAL },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: LINE2,
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: CORAL,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: LINE2,
    shadowColor: 'transparent',
    elevation: 0,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: INK },
  sheetDivider: { height: 1, backgroundColor: LINE },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryItemText: { fontSize: 16, color: INK },
  categoryItemSelected: { color: CORAL_PRESS, fontWeight: '600' },
});
