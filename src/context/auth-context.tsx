import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

type Profile = {
  id: string;
  email: string;
  nickname: string;
  manner_temp: number;
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
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  signInWithKakao: () => Promise<string | null>;
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

  async function signUp(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message ?? null;
  }

  async function signOut(): Promise<void> {
    try {
      // scope: 'local' — 기기의 세션만 제거한다. global 스코프는 서버 폐기 요청이
      // 실패(카카오 OAuth 토큰 만료 등)하면 예외를 던져 로그아웃이 막힐 수 있다.
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // 세션 폐기 요청 실패는 무시하고 로컬 상태를 강제로 정리한다.
    } finally {
      setSession(null);
      setProfile(null);
      setAccount(null);
    }
  }

  async function signInWithKakao(): Promise<string | null> {
    try {
      const { makeRedirectUri } = await import('expo-auth-session');
      const redirectUri = makeRedirectUri({ scheme: 'dangn' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: { skipBrowserRedirect: true, redirectTo: redirectUri },
      });
      if (error || !data.url) return error?.message ?? '카카오 로그인 실패';
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      if (result.type !== 'success') return null;
      // 콜백 URL에서 code 파라미터만 추출한다. exchangeCodeForSession은 URL 전체가
      // 아니라 auth code 문자열을 받는다.
      const query = new URLSearchParams(result.url.split('?')[1] ?? '');
      const errorDescription = query.get('error_description') ?? query.get('error');
      if (errorDescription) return errorDescription;
      const code = query.get('code');
      if (!code) return '카카오 로그인 실패';
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      return sessionError?.message ?? null;
    } catch {
      return '카카오 로그인 중 오류가 발생했어요.';
    }
  }

  return (
    <AuthContext.Provider value={{ session, profile, account, loading, signIn, signUp, signOut, signInWithKakao }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
