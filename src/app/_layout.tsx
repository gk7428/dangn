import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/context/auth-context';
import { ProductsProvider } from '@/context/products-context';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuth = (segments[0] as string) === 'login';
    if (!session && !inAuth) {
      router.replace('/login' as never);
    } else if (session && inAuth) {
      router.replace('/');
    }
  }, [session, loading]);

  return (
    <ProductsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ProductsProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
