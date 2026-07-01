import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured =
  !!SUPABASE_URL &&
  !!SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('YOUR_PROJECT_REF');

const ExpoSupabaseStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      storage: ExpoSupabaseStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      // OAuth(카카오) 콜백에서 exchangeCodeForSession을 쓰려면 PKCE 플로우가 필요하다.
      // 기본값 'implicit'에서는 code verifier가 생성되지 않아 코드 교환이 실패한다.
      flowType: 'pkce',
    },
  }
);
