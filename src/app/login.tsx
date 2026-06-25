import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';

const CORAL = '#FF5A4D';
const CORAL_PRESS = '#E8463A';
const BG = '#F6F3EE';
const INK = '#2A2723';
const INK2 = '#6E675F';
const INK3 = '#A49C92';
const LINE = '#F0EBE3';
const LINE2 = '#E4DCD1';

type Mode = 'login' | 'signup';

export default function LoginScreen() {
  const { signIn, signUp, signInWithKakao } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      WebBrowser.warmUpAsync().catch(() => {});
      return () => { WebBrowser.coolDownAsync().catch(() => {}); };
    }
  }, []);

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError('');
    setPassword('');
    setPasswordConfirm('');
  };

  const canSubmit =
    email.trim().length > 0 &&
    password.length >= 6 &&
    (mode === 'login' || password === passwordConfirm);

  const handleKakaoLogin = async () => {
    setError('');
    setKakaoLoading(true);
    const err = await signInWithKakao();
    setKakaoLoading(false);
    if (err) setError(err);
  };

  const handleSubmit = async () => {
    setError('');
    if (mode === 'signup' && password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않아요.');
      return;
    }
    setSubmitting(true);
    const err =
      mode === 'login'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(translateError(err));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* 로고 */}
          <View style={styles.logoArea}>
            <View style={styles.logoMark}>
              <ThemedText style={styles.logoMarkText}>🐟</ThemedText>
            </View>
            <ThemedText style={styles.logoTitle}>부산마켓</ThemedText>
            <ThemedText style={styles.logoSub}>우리 동네 중고 직거래</ThemedText>
          </View>

          {/* 폼 카드 */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>
              {mode === 'login' ? '로그인' : '회원가입'}
            </ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>이메일</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor={INK3}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>비밀번호</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="6자 이상 입력하세요"
                placeholderTextColor={INK3}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>비밀번호 확인</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    passwordConfirm.length > 0 && password !== passwordConfirm
                      ? styles.inputError
                      : null,
                  ]}
                  placeholder="비밀번호를 한 번 더 입력하세요"
                  placeholderTextColor={INK3}
                  secureTextEntry
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                />
              </View>
            )}

            {error.length > 0 && (
              <View style={styles.errorBox}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              activeOpacity={0.85}
              disabled={!canSubmit || submitting}
              onPress={handleSubmit}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.submitText}>
                  {mode === 'login' ? '로그인' : '회원가입'}
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>

          {/* 카카오 로그인 */}
          <TouchableOpacity
            style={styles.kakaoButton}
            activeOpacity={0.85}
            disabled={kakaoLoading}
            onPress={handleKakaoLogin}>
            {kakaoLoading ? (
              <ActivityIndicator color="#191919" />
            ) : (
              <ThemedText style={styles.kakaoButtonText}>카카오로 시작하기</ThemedText>
            )}
          </TouchableOpacity>

          {/* 모드 토글 */}
          <TouchableOpacity style={styles.toggleRow} activeOpacity={0.7} onPress={toggleMode}>
            <ThemedText style={styles.toggleText}>
              {mode === 'login' ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
            </ThemedText>
            <ThemedText style={styles.toggleLink}>
              {mode === 'login' ? '회원가입' : '로그인'}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않아요.';
  if (msg.includes('User already registered')) return '이미 가입된 이메일이에요.';
  if (msg.includes('Password should be at least')) return '비밀번호는 6자 이상이어야 해요.';
  if (msg.includes('Unable to validate email')) return '유효하지 않은 이메일 형식이에요.';
  if (msg.includes('Email rate limit exceeded')) return '잠시 후 다시 시도해 주세요.';
  if (msg.includes('Error sending confirmation email')) return '회원가입 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.';
  if (msg.includes('Signups not allowed')) return '현재 회원가입이 제한되어 있어요.';
  if (msg.includes('Email signups are disabled')) return '현재 이메일 회원가입이 비활성화되어 있어요.';
  return msg;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: BG },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 6,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: CORAL,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  logoMarkText: { fontSize: 36 },
  logoTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
  },
  logoSub: { fontSize: 14, color: INK2 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    gap: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: INK,
    marginBottom: 4,
  },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: INK2 },
  input: {
    borderWidth: 1,
    borderColor: LINE2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: INK,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: CORAL,
    backgroundColor: '#FFF5F5',
  },
  errorBox: {
    backgroundColor: '#FFF0EC',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: { fontSize: 13, color: CORAL_PRESS },
  submitButton: {
    backgroundColor: CORAL,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: CORAL,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: LINE2,
    shadowColor: 'transparent',
    elevation: 0,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 2,
  },
  toggleText: { fontSize: 14, color: INK2 },
  toggleLink: { fontSize: 14, color: CORAL, fontWeight: '700' },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#FEE500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  kakaoButtonText: { color: '#191919', fontSize: 16, fontWeight: '700' },
});
