import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const ExpoSupabaseStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null);
    }
    return require('@react-native-async-storage/async-storage').default.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return require('@react-native-async-storage/async-storage').default.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return Promise.resolve();
    }
    return require('@react-native-async-storage/async-storage').default.removeItem(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSupabaseStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
