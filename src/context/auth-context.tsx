import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// 웹 팝업 기반 OAuth 세션을 마무리한다(웹 전용, 네이티브에서는 무해).
WebBrowser.maybeCompleteAuthSession();

// OAuth 콜백으로 돌아온 URL에서 auth code를 추출해 Supabase 세션으로 교환한다.
// flowType: 'pkce'이므로 signInWithOAuth 단계에서 저장해 둔 code_verifier와 함께
// 교환되며, 성공하면 세션이 저장되고 onAuthStateChange(SIGNED_IN)가 발화한다.
async function createSessionFromUrl(url: string): Promise<string | null> {
  const { queryParams } = Linking.parse(url);
  const authError = (queryParams?.error_description ?? queryParams?.error) as string | undefined;
  if (authError) return decodeURIComponent(authError);
  const code = queryParams?.code;
  if (typeof code !== 'string' || !code) return '카카오 로그인에 실패했어요.';
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return error?.message ?? null;
}

type Profile = {
  id: string;
  email: string;
  nickname: string;
  manner_temp: number;
  points: number;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
};

type Account = {
  id: string;
  email: string;
  tier: 'free' | 'paid';
  role: 'admin' | 'user';
  created_at: string;
};

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  account: Account | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, referralCode?: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  signInWithKakao: () => Promise<string | null>;
  redeemReferral: (code: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data ?? null);
  }

  async function loadAccount(userId: string) {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single();
    setAccount(data ?? null);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession()
      .then(({ data }) => {
        setSession(data.session);
        if (data.session) {
          loadProfile(data.session.user.id);
          loadAccount(data.session.user.id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const { data: listener } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      if (s) {
        loadProfile(s.user.id);
        loadAccount(s.user.id);
      } else {
        setProfile(null);
        setAccount(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }

  async function signUp(email: string, password: string, referralCode?: string): Promise<string | null> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;

    // 이메일 확인이 꺼져 있어 가입 즉시 세션이 생기면, 입력한 추천 코드를 바로 사용한다.
    // (이메일 확인이 켜져 있어 세션이 없으면, 사용자는 나중에 "나의부산"에서 코드를 입력할 수 있다.)
    if (data.session && referralCode?.trim()) {
      // 가입 자체는 성공했으므로 추천 코드 처리 실패는 조용히 넘어간다(나의부산에서 재시도 가능).
      await redeemReferral(referralCode).catch(() => {});
    }
    return null;
  }

  // 친구의 추천 코드를 사용해 양쪽에 1000포인트를 지급한다. 성공 시 null, 실패 시 에러 메시지 반환.
  async function redeemReferral(code: string): Promise<string | null> {
    const trimmed = code.trim();
    if (!trimmed) return '추천 코드를 입력해주세요.';
    const { data, error } = await supabase.rpc('redeem_referral', { p_code: trimmed });
    if (error) return error.message;
    const result = data as { success?: boolean; error?: string } | null;
    if (!result?.success) return result?.error ?? '추천 코드 처리에 실패했어요.';
    // 지급된 포인트를 즉시 반영하기 위해 프로필을 다시 불러온다.
    const uid = session?.user?.id;
    if (uid) await loadProfile(uid);
    return null;
  }

  async function signOut(): Promise<void> {
    // 로컬 상태를 "먼저" 비운다. supabase.auth.signOut()은 scope와 무관하게 내부적으로
    // 세션 폐기(admin.signOut) 네트워크 요청을 하는데, 카카오 로그인처럼 앱이 인앱
    // 브라우저로 백그라운드에 다녀온 뒤에는 이 요청이 지연/중단되어 await가 끝나지
    // 않을 수 있다. 상태 정리를 await 뒤(finally)에 두면 그 경우 로그아웃이 멈춘 것처럼
    // 보인다. 그래서 UI 로그아웃을 네트워크 응답과 분리한다.
    setSession(null);
    setProfile(null);
    setAccount(null);
    try {
      // scope: 'local' — 이 기기의 세션/저장소만 정리한다.
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // 저장소/서버 세션 정리 실패는 무시한다. UI는 이미 로그아웃 상태다.
    }
  }

  async function signInWithKakao(): Promise<string | null> {
    if (!isSupabaseConfigured) return '로그인 서비스가 아직 설정되지 않았어요.';
    try {
      const { makeRedirectUri } = await import('expo-auth-session');
      // app.json의 "scheme": "dangn"과 일치하는 리다이렉트 URI(dangn://).
      // Supabase 대시보드의 Redirect URLs에도 이 값이 등록되어 있어야 한다.
      const redirectTo = makeRedirectUri({ scheme: 'dangn' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: { skipBrowserRedirect: true, redirectTo },
      });
      if (error || !data?.url) return error?.message ?? '카카오 로그인에 실패했어요.';
      // 카카오 인증 페이지를 열고, 앱 scheme으로 돌아온 콜백 URL을 수신한다.
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success') return null; // 사용자가 취소/닫으면 조용히 종료
      // 돌아온 URL에서 code를 꺼내 세션을 생성한다. 성공 시 onAuthStateChange가
      // SIGNED_IN을 발화해 session 상태가 갱신되고 라우터가 홈으로 이동한다.
      return await createSessionFromUrl(result.url);
    } catch {
      return '카카오 로그인 중 오류가 발생했어요.';
    }
  }

  return (
    <AuthContext.Provider value={{ session, profile, account, loading, signIn, signUp, signOut, signInWithKakao, redeemReferral }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
